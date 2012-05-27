"use strict";

/**
 * Build an "Abstract Syntax Tree" from the code tokens
 * @param tokens
 * @return {Tag}
 */
var funex = require("funex");
var tags = require("./tags");

function build(tokens) {
	var root;
	var stack; // stack in reverse order
	var tag;
	var name;
	var args;
	var token;
	var chainHead = null; // Initial tag which is wrapped be the tag chain
	var chainTail = null; // Latest tag which is wrapping he chained tag
	var isChained;
	var isInsideTag;
	var isSelfClosing;
	var tagContentString;
	var isCommented;
	var toggleWhitespace;

	// Create the root tag
	root = new Tag("#root", "").compile();
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
		name = "#raw"; // default tag name
		if (isInsideTag) {
			name = tagContentString.split(" ")[0].trim();
			args = tagContentString.substring(name.length);

			// Test if the tag is commented out with the "!" character
			if (name[0] === "!") {
				name = name.substring(1);
				isCommented = true;
			}

			// Test if the tag is trimming whitespaces with the "@" character
			if (name[0] === "@") {
				name = name.substring(1);
				toggleWhitespace = true;
			}

			// Test if there is a named tag, or auto tag
			// todo: redundant check... this check is also done in the Tag constructor
			if (name[0] !== "#" && name[0] !== "/") {
				args = name + " " + args;
				name = "#auto";
			}

			if (name[0] === "/") {
				// If is a closing tag
				stack.shift();
				continue;
			}

			tag = new Tag(name, args);
			tag.isCommented = isCommented;
			tag.toggleWhitespace = toggleWhitespace;

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
	var autoTagName;
	this.tags = [];
	this.tags.render = renderTags;
	this.isRaw = false;
	this.isCommented = false;
	this.toggleWhitespace = false;
	this.name = name;
	this.argString = argString;
	this.autoIsTag = false;
	this.handler = tags[this.name];
	//todo: not sure if the auto/not-auto choice should be done here or before creating the tag
	// If no tag handler is found, fallback to the auto tag
	if (!this.handler) {
		this.handler = tags["#auto"];
		if (this.name[0] === "#") {
			this.autoIsTag = true;
			autoTagName = "'" + this.name.substring(1) + "'";
			this.argString = (this.argString) ? autoTagName + ", " + this.argString : autoTagName;
		}
	}

	this.args = function () {
		return void 0
	};

	this.compile = function () {
		// Arguments
		if (this.isRaw) {
			this.args = function raw() {
				return [this.argString];
			}
		} else {
			if (this.argString.trim() !== "") {
				this.args = funex("$Array(" + this.argString + ")");
			} else {
				this.args = function () {
					return void 0
				};
			}
		}

		return this;
	};

	this.render = function (context, parentFrame) {
		// Add a new frame to the context
		var output = "",
			frame = {
				$parent: parentFrame
			};
		context.push(frame);

		// Toggle whitespace removal if needed
		// TODO: READ $removeWhitespaces recursivelly from the context
		if (this.toggleWhitespace) frame.$removeWhitespaces = !frame.$removeWhitespaces;

		//todo: raise syntax error for invalid/unknown tags
		if (!this.isCommented) {
			output = this.handler.call(this, context, frame);
		}

		// Remove the tag's frame from the context
		context.pop();
		return output;
	};

	function renderTags(context, frame) {
		var i;
		var str = "";
		for (i = this.length - 1; i >= 0; i--) {
			str = str + this[i].render(context, frame);
		}
		return str;
	}
}

module.exports = {
	Tag:Tag,
	build:build
};
