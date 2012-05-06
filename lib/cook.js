(function () {
	var tags,
		funex = require("funex"),
		options = {
			startDelimiter:"{{",
			endDelimiter:"}}",
			alternateTagDelimiter:"-",
			filtersDelimiter:"=>",
			endTagDelimiter:"/"
		};

	/**
	 * Render a template into an executable function
	 * @param template
	 * @return {*}
	 */
	function main(template) {
		var tokens, root;
		// todo: no support yet for delimiters of variable length
		tokens = lexer(template, options.startDelimiter, options.endDelimiter);
		root = builder(tokens);
		return function render(data) {
			//todo: where should this Array function be there ?
			data.__Array = Array; // Used when compiling funex with multiple arguments
			return root.render(data)
		};
	}

	/**
	 * Build an "Abstract Syntax Tree" from the code tokens
	 * @param tokens
	 * @return {Tag}
	 */
	function builder(tokens) {
		var
			root = new Tag("root", ""),
			stack = [root], // stack in reverse order
			tag,
			name,
			args,
			token,
			isInsideTag,
			isSelfClosing,
			tagContentString;

		while (tokens.length > 0) {
			token = tokens.shift();
			isInsideTag = token[0];
			isSelfClosing = token[1];
			tagContentString = token[2];

			if (isInsideTag) {
				// If is a Self-closing tag
				name = tagContentString.split(" ")[0];
				args = tagContentString.substring(name.length);
				// todo: extract "filter" expression string
				if (isSelfClosing) {
					tag = new Tag(name, args);
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
				} else if (name.split(options.alternateTagDelimiter).length > 1) {
					// If is an alternate tag
					tag = new Tag(name, args, true);
					// If we are already in an altTag, first shift the stack to
					// come back to the original tag
					if (stack.length > 1 && stack[0].isAltTag) {
						stack.shift();
					}
					stack[0].altTags.unshift(tag);
					stack.unshift(tag);
				} else {
					// If is an ordinary tag
					tag = new Tag(name, args);
					stack[0].tags.unshift(tag);
					stack.unshift(tag);
				}
			} else {
				// Create a "raw" tag for every token that is not part of an actual tag
				tag = new Tag("raw", tagContentString, false, true);
				stack[0].tags.unshift(tag);
			}
		}
		return root;
	}

	/**
	 * A tag object!
	 * @param name
	 * @param argString
	 * @constructor
	 */
	function Tag(name, argString, isAltTag, isRaw) {
		this.name = name;
		this.tags = [];
		this.tags.render = renderTags;
		this.altTags = [];
		this.altTags.render = renderTags;
		this.isAltTag = isAltTag || false;
		this.isRaw = isRaw || false;
		this.handler = tags[this.name] || tags["raw"];
		this.argString = argString;
		if (this.isRaw) {
			this.args = function raw() {
				return [this.argString];
			}
		} else {
			// todo: handle funex compilation errors
			if (argString.trim() !== "") {
				this.args = funex("__Array(" + argString + ")");
			} else {
				this.args = function () { return void 0 };
			}
		}
		//todo: handle filters
//		this.filters = function () { return "" };
		this.render = function(data) {
			//todo: raise syntax error for invalid/unknown tags
			return this.handler.call(this, data);
		};

		function renderTags(data) {
			var str = "";
			for (var i = this.length-1; i >= 0; i--) {
				str = str + this[i].render(data);
			}
			return str;
		}
	}


	//todo: register functions through a "use" method
	function root(data) {
		return this.tags.render(data);
	}
	function raw(data) {
		var args = this.args(data);
		if (args) return args[0];
		return "";
	}
	function print(data) {
		var args = this.args(data);
		if (args) {
			return args.join();
		} else if (this.tags) {
			return this.tags.render(data);
		}
		return "";
	}
	function ifElseIf(data) {
		var i, args,
			isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
			str = "", altTag;
		if (this.tags) {
			args = this.args(data);
			isUndefinedOrTrue = (args === void 0 || args && args[0]);
			if (isUndefinedOrTrue) {
				str = this.tags.render(data);
			} else {
				for (i = this.altTags.length-1; i >= 0; i--) {
					altTag = this.altTags[i];
					if (altTag.name === "if-else") {
						args = altTag.args(data);
						isUndefinedOrTrue = (args === void 0 || args && args[0]);
						if (isUndefinedOrTrue) {
							// todo: create a new tag instead of modifying the existing one
							str = str + altTag.render(data);
							break;
						}
					}
				}
			}
		}
		// todo: handle else statements
		return str;
	}

	tags = {
		"root": root,
		"raw": raw,
		"print":print,
		"if": ifElseIf,
		"if-else": ifElseIf
	};


	/**
	 * Lexing function that break up a template string source into syntactic tokens
	 * @param template
	 * @param start
	 * @param end
	 * @return {Array}
	 */
	//todo: tokens should be objects for better inspection
	//todo: The lexer should be the only one to use delimiters and provide boolean flags on tokens
	function lexer(template, start, end) {
		var
			i,
			closing,
			token,
			tokens = [],
			splits = [],
			isSelfClosing;
		// Find all occurences of start delimiters
		if (template) {
			for (i = template.indexOf(start); i >= 0; i = template.indexOf(start, i + 1)) {
				splits.push(i);
			}
			// Add a last marker for the end of the template
			splits.push(template.length);
			// Add the first token (from 0 to first start)
			tokens.push([
				false, // If token is inside a tag or outside
				false,
				template.substring(0, splits[0])
			]);
			for (i = 0; i < splits.length; i++) {
				closing = template.indexOf(end, splits[i]);
				if (closing >= 0) {
					token = template.substring(splits[i] + 2, closing);
					isSelfClosing = (token[token.length - 1] === options.endTagDelimiter);
					if (isSelfClosing) token = token.substring(0, token.length - 1); // Remove the closing slash
					tokens.push([
						true,
						isSelfClosing, // Test if is self-closing
						token
					]);
					token = template.substring(closing + 2, splits[i + 1]); // todo: refactor: Is this line the same as above ???
					tokens.push([
						false,
						false,
						token
					]);
				}
			}
		}
		return tokens;
	}

	/**
	 * Get an options value
	 * @param attr
	 * @return {*}
	 */
	function get (attr) {
		return options[attr];
	}

	/**
	 * Set an options value
	 * @param attr
	 * @param value
	 * @return {*}
	 */
	function set (attr, value) {
		options[attr] = value;
		return options[attr];
	}

	main.lexer = lexer;
	main.builder = builder;
	main.get = get;
	main.set = set;
	module.exports = main;

})();