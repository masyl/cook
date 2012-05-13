"use strict";

/**
 * Build an "Abstract Syntax Tree" from the code tokens
 * @param tokens
 * @return {Tag}
 */
var funex = require("funex"),
	tags = require("./tags");

function build(tokens, options) {
	var
		root,
		stack, // stack in reverse order
		tag,
		name,
		args,
		filter = "",
		token,
		split,
		isInsideTag,
		isSelfClosing,
		tagContentString,
		isCommented,
		toggleWhitespace;

	// Create the root tag
	root = new Tag("root", "", "").compile();
	stack = [root];

	while (tokens.length > 0) {
		token = tokens.shift();
		isInsideTag = token[0];
		isSelfClosing = token[1];
		tagContentString = token[2];
		isCommented = false;
		toggleWhitespace = false;
		args = tagContentString;
		filter = "";
		name = "raw"; // default tag name
		if (isInsideTag) {
			name = tagContentString.split(" ")[0];

			split = tagContentString.substring(name.length).split(options.after);
			args = split[0];
			filter = split[1];

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

			// todo: extract "filter" expression string
			tag = new Tag(name, args, filter);
			tag.isCommented = isCommented;
			tag.toggleWhitespace = toggleWhitespace;

			if (isSelfClosing) {
				stack[0].tags.unshift(tag);
			} else if (name[0] === "/") {
				// If is a closing tag
				name = name.substring(1);
				// If we are in an altTag, first shift the stack to
				// come back to the original tag
				if (stack.length > 1 && stack[0].isAltTag) {
					stack.shift();
				}
				// todo: before shifting the stack, check if we are closing
				// the right tag... otherwise raise a structure error.
				stack.shift();
			} else if (name.split(options.alt).length > 1) {
				// If is an alternate tag
				tag.isAltTag = true;
				// If we are already in an altTag, first shift the stack to
				// come back to the original tag
				if (stack.length > 1 && stack[0].isAltTag) {
					stack.shift();
				}
				stack[0].altTags.unshift(tag);
				stack.unshift(tag);
			} else {
				// If is an ordinary tag
				stack[0].tags.unshift(tag);
				stack.unshift(tag);
			}
		} else {
			// Create a "raw" tag for every token that is not part of an actual tag
			tag = new Tag(name, args, filter);
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
function Tag(name, argString, filterString) {
	this.name = name;
	this.tags = [];
	this.tags.render = renderTags;
	this.altTags = [];
	this.altTags.render = renderTags;
	this.isAltTag = false;
	this.isRaw = false;
	this.isCommented = false;
	this.toggleWhitespace = false;
	// todo: refactor dependency on cook.xyz
	this.handler = tags[this.name] || tags["default"];

	this.args = function () { return void 0 };
	this.filter = function () { return void 0 };

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

		// Filters
		this.filterString = filterString;
		if (this.filterString && this.filterString.trim() !== "") {
			var fn = funex("$Array(" + this.filterString + ")");
			this.filter = function filter(data) {
				var result = fn(data);
				// The filter returned a function, so this function will
				// be used to parse the output once more
				// This allow this simplified syntax : {{print >> encodeURI /}}/some/url{{/print}}
				if (result && result.length > 0 && typeof result[0] === "function") {
					result = result[0](data.$body);
				}
				return result;
			};
		} else {
			//todo: optimize, when no filter, you should simply do nothing instead of passing through
			// this blank filter
			this.filter = function blankFilter(data) {
				return data.$body
			}
		}
		return this;
	};


	this.render = function(data) {
		var str = this.renderUnfiltered(data); // Output if placed in this.$body
		return this.filter(data);
	};

	this.renderUnfiltered = function(data) {
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
