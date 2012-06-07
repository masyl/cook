"use strict";

module.exports = function (cook) {
	/**
	 * Build an "Abstract Syntax Tree" from the code tokens
	 * @param tokens
	 * @return {Tag}
	 */
	var Tag = global["tag"] || require("./tag");

	Tag = Tag(cook);

	return function build(_tokens, tags) {
		var tokens = _tokens.slice(0);
		var root;
		// todo: refactor: bring back the stack in normal order
		var stack; // node: the stack is in reverse order
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
	
		// Create the root tag
		root = new Tag("write", "", tags).compile();
		stack = [root];
	
		while (tokens.length > 0) {
			token = tokens.shift();
			isChained = token[0];
			isInsideTag = token[1];
			isSelfClosing = token[2];
			tagContentString = token[3];
			isCommented = false;
			args = tagContentString;
			name = "write"; // default tag name
			if (isInsideTag) {
	
				if (tagContentString[0] === "/") {
					// If is a closing tag
					stack.shift();
					continue;
				}
	
				// Test if the tag is commented out with the "#" character
				if (tagContentString[0] === "#") {
					tagContentString = tagContentString.substring(1);
					isCommented = true;
				}
	
				// Test if there is a named tag, or auto tag
				if (tagContentString[0] === "=") {
					tagContentString = tagContentString.substring(1);
					name = "auto";
					args = tagContentString;
				} else {
					name = tagContentString.split(" ")[0].trim();
					args = tagContentString.substring(name.length);
				}
	
				tag = new Tag(name, args, tags);
				tag.isCommented = isCommented;
	
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
				tag = new Tag(name, args, tags);
				tag.isRaw = true;
				stack[0].tags.unshift(tag);
			}
			tag.compile();
		}
		return root;
	};
};