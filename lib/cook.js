"use strict";
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
			// Used when compiling funex with multiple arguments
			data.__Array = function () {
				return Array.prototype.slice.call(arguments, 0);
			};
			data.encodeURI = encodeURI;
			data.decodeURI = decodeURI;
			data.encodeURIComponent = encodeURIComponent;
			data.decodeURIComponent = decodeURIComponent;
			data.log = function(body) {
				console.log.apply(console, arguments);
				return data.body;
			};
			// Return a partial template
			data.partial = getPartial;
			
			return root.render(data)
		};
	}
	//todo: ensure this is scoped properly and not global
	var partials = {};

	function getPartial(name) {
		return partials[name];
	}
	
	function Partial(name, tags, argNames, data) {
		this.name = name;
		this.tags = tags;
		this.render = function () {
			var output;
			//todo: these attributes should be stacked onto the data
			// Transfer the arguments passed to the partial into named arguments into the data scope
			for (var i = 0; i < argNames.length; i++) {
				if (i < arguments.length) data[argNames[i]] = arguments[i];
			}
			output = this.tags.render(data);
			return output;
		};
	}

	/**
	 * Build an "Abstract Syntax Tree" from the code tokens
	 * @param tokens
	 * @return {Tag}
	 */
	function builder(tokens) {
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
			isCommented;

		// Create the root tag
		root = new Tag("root", "", "").compile();
		stack = [root];

		while (tokens.length > 0) {
			token = tokens.shift();
			isInsideTag = token[0];
			isSelfClosing = token[1];
			tagContentString = token[2];
			isCommented = false;
			args = tagContentString;
			filter = "";
			name = "raw"; // default tag name
			if (isInsideTag) {
				name = tagContentString.split(" ")[0];

				split = tagContentString.substring(name.length).split(options.filtersDelimiter);
				args = split[0];
				filter = split[1];

				// Test if the tag is commented out with the "#" character
				if (name[0] === "#") {
					name = name.substring(1);
					isCommented = true;
				}

				// todo: extract "filter" expression string
				tag = new Tag(name, args, filter);
				tag.isCommented = isCommented;

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
				} else if (name.split(options.alternateTagDelimiter).length > 1) {
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
		this.handler = tags[this.name] || tags["raw"];

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
				// todo: handle funex compilation errors
				if (this.argString.trim() !== "") {
					this.args = funex("__Array(" + this.argString + ")");
				} else {
					this.args = function () { return void 0 };
				}
			}

			// Filters
			this.filterString = filterString;
			if (this.filterString && this.filterString.trim() !== "") {
				var fn = funex("__Array(" + this.filterString + ")");
				this.filter = function filter(data) {
					var result = fn(data);
					// The filter returned a function, so this function will
					// be used to parse the output once more
					// This allow this simplified syntax : {{print => encodeURI /}}/some/url{{/print}}
					if (result && result.length > 0 && typeof result[0] === "function") {
						result = result[0](data.body);
					}
					return result;
				};
			} else {
				//todo: optimize, when no filter simply do nothing.
				this.filter = function (data) {
					return data.body
				};
			}
			return this;
		};
		

		this.render = function(data) {
			//todo: raise syntax error for invalid/unknown tags
			if (this.isCommented) return "";
			data.body = this.handler.call(this, data);
			return this.filter(data);
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
		if (args && args.length > 0) {
			return args.join();
		} else if (this.tags) {
			return this.tags.render(data);
		}
		return "";
	}
	function varTag(data) {
		var value,
			args = this.args(data);
		if (args && args.length > 1) {
			data[args[0]] = args[1];
		} else if (this.tags && args.length > 0) {
			value = this.tags.render(data);
			data[args[0]] = value;
		}
		return "";
	}
	function withTag(data) {
		var arg,
			args = this.args(data);
		if (args && args.length > 0 && this.tags) {
			for (var i = 0; i < args.length; i++) {
				arg = args[i];
				for (var key in arg) {
					if (arg.hasOwnProperty(key)) {
						data[key] = arg[key];
					}
				}
			}
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
	function each(data) {
		var i,
			key,
			source,
			keys = [],
			values = [],
			args,
			str = "";
		if (this.tags) {
			args = this.args(data);
			if (args && args.length) {
				source = args[0];
				if (!(source instanceof Array)) {
					for (key in source) {
						if (source.hasOwnProperty(key)) {
							keys.push(key);
							values.push(source[key]);
						}
					}
					source = values;
				}
				for (i = 0; i < source.length; i++) {
					data["each"] = {
						index: i,
						key: keys[i],
						value: source[i],
						isFirst: i == 0,
						isLast: i+1 === values.length,
						isOdd: !!(i % 2),
						length: source.length
					};
					str = str + this.tags.render(data);
				}
			}
		}
		return str;
	}

	/**
	 * Tag handler for defining partial templates for later reuse
	 * @param data
	 * @return {String}
	 */
	function partial(data) {
		var args, name, partial;
		if (this.tags) {
			args = this.args(data);
			if (args && args.length) {
				name = args.shift();
				partial = new Partial(name, this.tags, args, data);
				partials[name] = partial;
			}
		}
		return "";
	}

	tags = {
		"root": root,
		"raw": raw,
		"print": print,
		"if": ifElseIf,
		"if-else": ifElseIf,
		"each": each,
		"partial": partial,
		"var": varTag,
		"with": withTag
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