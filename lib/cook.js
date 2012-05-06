(function () {
	var funex = require("funex");

	// todo: options defaults ?
	var
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
		// todo: no support yet for delimiters of variable length
		var tokens = lexer(template, options.startDelimiter, options.endDelimiter);
		var tree = build(tokens);
		return compile(tree);
	}

	/**
	 * Build a execution tree by parsing tokens
	 * @param tokens
	 */
	function build(tokens) {
		//		return parseTagList(tokens, [0]);
		return buildAST(tokens);
	}

	/**
	 * Build an "Abstract Syntax Tree" from the code tokens
	 * @param tokens
	 * @return {Tag}
	 */
	function buildAST(tokens) {
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
					name = name.split(options.alternateTagDelimiter)[1];
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
				tag = new Tag("raw", token[2]);
				stack[0].tags.unshift(tag);
			}
		}
		return root;
	}

	/**
	 * A tag object!
	 * @param name
	 * @param args
	 * @constructor
	 */
	function Tag(name, args, isAltTag) {
		this.name = name;
		this.args = args;
		this.filters = [];
		this.tags = [];
		this.altTags = [];
		this.isAltTag = isAltTag || false;
	}

	/**
	 * Execute the instructions of an execution tree with a specific data
	 * as it' execution context
	 * @param tree
	 * @param data
	 */
	function execute(tree, data) {
		return renderTag(tree, data);
	}

	function renderTag(tag, data) {
		var str = "",
			handler = tags[tag.name];
		//todo: raise syntax error for invalid/unknown tags
		if (handler) {
			str = handler(tag, data)
		}
		return str;
	}

	function renderTags(tags, data) {
		var str = "";
		if (tags) {
			for (var i = tags.length-1; i >= 0; i--) {
				str = str + renderTag(tags[i], data);
			}
		}
		return str;
	}

	var tags = {
		"root":function (tag, data) {
			return renderTags(tag.tags, data);
		},
		"raw":function (tag) {
			return tag.args;
		},
		"print":function (tag, data) {
			var str = "";
			if (tag.tags) {
				str = renderTags(tag.tags, data);
			} else {
				str = funex(tag.args)(data);
			}
			return str;
		},
		"if":function (tag, data) {
			var i, str = "", altTag;
			if (tag.tags) {
				if (funex(tag.args)(data)) {
					str = renderTags(tag.tags, data);
				} else {
					for (i = 0; i < tag.altTags.length; i++) {
						if (tag.altTags[i].name === "else") {
							altTag = tag.altTags[i];
							altTag.name = "if";
							// todo: create a new tag instead of modifying the existing one
							str = str + renderTag(altTag, data);
						}
					}
				}
			}
			// todo: handle else statements
			return str;
		}
	};

	/**
	 * Return an executable function from an execution tree
	 * @param tree
	 * @return {Function}
	 */
	function compile(tree) {
		return function (data) {
			return execute(tree, data);
		}
	}

	/**
	 * Lexing function that break up a template string source into syntactic tokens
	 * @param template
	 * @param start
	 * @param end
	 * @return {Array}
	 */
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

	main.get = get;
	main.set = set;
	module.exports = main;

})();