"use strict";

/**
 * Build an "Abstract Syntax Tree" from the code tokens
 * @param tokens
 * @return {Tag}
 */
var funex = require("funex"),
	tags = require("./tags");

function build(tokens) {
	var
		root,
		stack, // stack in reverse order
		tag,
		name,
		args,
		token,
		chainHead = null, // Initial tag which is wrapped be the tag chain
		chainTail = null, // Latest tag which is wrapping he chained tag
		isChained,
		isInsideTag,
		isSelfClosing,
		tagContentString,
		isCommented,
		toggleWhitespace;

	// Create the root tag
	root = new Tag("root", "").compile();
	stack = [root];

	while (tokens.length > 0) {
		token = tokens.shift();
		isChained = token[0];
		isInsideTag = token[1];
		isSelfClosing = token[2];
		tagContentString = token[3];
		isCommented = false;
		toggleWhitespace = false;
		args = tagContentString;
		name = "raw"; // default tag name
		if (isInsideTag) {
			name = tagContentString.split(" ")[0];
			args = tagContentString.substring(name.length);

			// Test if the tag is commented out with the "#" character
			if (name[0] === "#") {
				name = name.substring(1);
				isCommented = true;
			}

			// Test if the tag is commented out with the "#" character
			if (name[0] === "!") {
				name = name.substring(1);
				toggleWhitespace = true;
			}

			tag = new Tag(name, args);
			tag.isCommented = isCommented;
			tag.toggleWhitespace = toggleWhitespace;

			if (name[0] === "/") {
				// If is a closing tag
				stack.shift();
			} else {
				// Add the new tag to either the main stack or the chained-tag stack
				// swap chainTail with chainHead
				if (chainTail) {
					chainTail.tags.unshift(tag);
					chainTail = tag;
				}
				if (isChained) {
					// If there is no chainTail create it
					if (!chainHead) chainHead = tag;
					// Move the chain head pointer to the current tag
					chainTail = tag;
				} else {
					if (chainTail) {
						stack[0].tags.unshift(chainHead);
						// Add the chain tail to the stack if it is not a self closing tag
						// (it will chain any upcomming child tags)
						if (!isSelfClosing) stack.unshift(chainTail);
						// Clear the chain
						chainTail = chainHead = null;
					} else {
						stack[0].tags.unshift(tag);
						if (!isSelfClosing) stack.unshift(tag);
					}
				}
			}
		} else {
			// Create a "raw" tag for every token that is not part of an actual tag
			tag = new Tag(name, args);
			tag.isRaw = true;
			stack[0].tags.unshift(tag);
		}
		tag.compile();
	}
	return root;
}

/**
 * A tag object!
 * @param name
 * @param argString
 * @constructor
 */
function Tag(name, argString) {
	this.name = name;
	this.tags = [];
	this.tags.render = renderTags;
	this.isRaw = false;
	this.isCommented = false;
	this.toggleWhitespace = false;
	this.handler = tags[this.name] || tags["default"];

	this.args = function () { return void 0 };

	this.compile = function() {
		// Arguments
		this.argString = argString;
		if (this.isRaw) {
			this.args = function raw() {
				return [this.argString];
			}
		} else {
			if (this.argString.trim() !== "") {
				this.args = funex("$Array(" + this.argString + ")");
			} else {
				this.args = function () { return void 0 };
			}
		}

		return this;
	};


	this.render = function(data) {
		// Toggle whitespace removal if needed
		if (this.toggleWhitespace) data.$removeWhitespaces = !data.$removeWhitespaces;
		//todo: raise syntax error for invalid/unknown tags
		if (this.isCommented) {
			data.$body = "";
		} else  {
			data.$body = this.handler.call(this, data);
			// Toggle back whitespace removal
			if (this.toggleWhitespace) data.$removeWhitespaces = !data.$removeWhitespaces;
		}
		return data.$body;
	};

	function renderTags(data) {
		var str = "";
		for (var i = this.length-1; i >= 0; i--) {
			str = str + this[i].render(data);
		}
		return str;
	}
}

module.exports = {
	Tag: Tag,
	build: build
};
