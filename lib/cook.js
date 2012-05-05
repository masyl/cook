(function () {
	var funex = require("funex");

	// todo: options defaults ?
	var
			options = {
				startDelimiter: "{{",
				endDelimiter: "}}",
				alternateTagDelimiter: "-",
				filtersDelimiter: ">>",
				endTagDelimiter: "/"
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
		return parseTagList(tokens, [0]);
	}

	/**
	 * Execute the instructions of an execution tree with a specific data
	 * as it' execution context
	 * @param tree
	 * @param data
	 */
	function execute(tree, data) {
		return renderTagList(tree, data);
	}


	function renderTagList(tagList, data) {
		var
				tagSet,
				str = "";
		for (var i = 0; i < tagList.length; i++) {
			tagSet = tagList[i];
			str = str + renderTagSet(tagSet, data);
		}
		return str;
	}

	function renderTagSet(tagSet, data) {
		var
				mainTag,
				tagHandler,
				str;
		mainTag = tagSet.shift();
		if (mainTag) {
			tagHandler = tags[mainTag[0]];
			// tag : [name, args, filters, childs]
			str = tagHandler(mainTag[1], mainTag[2], mainTag[3], tagSet, data);
		}
		return str;
	}

	var tags = {
		"raw": function (args, filters, childs, alternateTags, data) {
			return args;
		},
		"out": function (args, filters, childs, alternateTags, data) {
			var str = "";
			if (childs) {
				str = renderTagList(childs, data);
			} else {
				str = funex(args)(data);
			}
			return str;
		},
		"if": function (args, filters, childs, alternateTags, data) {
			var str = "";
			if (childs) {
				if (funex(args)(data)) {
					str = renderTagList(childs, data);
				}
			}
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


	function parseTagList(tokens, index) {
		var
				tagList = [],
				result,
				tagSet,
				closingTag;
		//todo: Test for syntax error : bad sequence of opening and closing delimiters : {{ }} {{ }} {{ }}
		while (index[0] < tokens.length) {
			result = parseTagSet(tokens, index);
			tagSet = result[0];
			closingTag = result[1];
			// Verify if the closing tag matches the opening tag
			if (tagSet.length) tagList.push(tagSet);
			if (closingTag)
				break;
		}
		return tagList;
	}

	/**
	 * Parse the next tokens and return a tagSet (tag set = tag + alternate tag in an array)
	 * @param tokens
	 * @return {Array}
	 */
	function parseTagSet(tokens, index) {
		var
				firstTag = null,
				tagSet = [],
				result,
				tag,
				exitSet;

		while (index[0] < tokens.length) {
			result = parseTag(tokens, index);
			tag = result[0];
			exitSet = result[1];
//			exitList = result[2];
			if (tag) {
				// If it is a second or more tag of the tagSet
				// start looking for alternate tags or end tags
				if (tag[0][0] === options.endTagDelimiter) {
					return [tagSet, tag]; // todo: refactor:  Or use exitList boolean
				}
				if (firstTag) {
					if (tag[0].substring(0, firstTag[0].length + 1) === firstTag[0] + options.alternateTagDelimiter) { // todo: refactor: use indexOf ?
						// Else if is an alternate tag for the open tag
						tagSet.push(tag);
					} else {

						index[0] = index[0] - 1;

						return [tagSet, null];
					}
				} else if (exitSet) {
					tagSet.push(tag);
					return [tagSet, null];
				} else {
					tagSet.push(tag);
					firstTag = tag;
				}
			} else {
				return [tagSet, null];
			}
		}
		return [tagSet, null];
	}

	function parseTag(tokens, index) {
		var
				token = tokens[index[0]], // Get the token for the current iteration
				content,
				name,
				tagExpressions,
				tag,
				args = null,
				filters = null,
				childs = null;

		index[0] = index[0] + 1;

		if (token) {
		// If this token opens a tag
			if (token[0]) {
				// The actual content of the tag (plus a space to always get a indexOf)
				content = token[2] + " ";
				// Isolate the tag name
				name = content.substring(0, content.indexOf(" "));
				// Isolate the list of funex expressions
				tagExpressions = content.substring(name.length).split(options.filtersDelimiter);
				// Get the list of arguments from the first item
				if (tagExpressions.length)
					args = tagExpressions.shift();
				// Get the list of filter from the remaining items
				if (tagExpressions.length)
					filters = tagExpressions;

				// If tag is not self-closing, or a closing tag, we need to parse its child tags
				if (!token[1] && name[0] !== options.endTagDelimiter) {
					childs = parseTagList(tokens, index);
					return [[name, args, filters, childs], false, (name[0] !== options.endTagDelimiter)];
				} else {
					return [[name, args, filters, null], true, false];
				}
			} else {
				//     [name, args, filters, childs];
				return [["raw", token[2], null, null], true, false];
			}
		} else {
			throw "OUT OF BOUND ! ! ! ";
		}
	}

	/**
	 * Break up a template into a series of tokens
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
			for (i = template.indexOf(start); i >= 0; i = template.indexOf(start, i+1)) {
				splits.push(i);
			}
			// Add a last marker for the end of the template
			splits.push(template.length);
			// Add the first token (from 0 to first start)
			tokens.push([
				false,
				false,
				template.substring(0, splits[0])
			]);
			for (i = 0; i < splits.length; i++) {
				closing = template.indexOf(end, splits[i]);
				if (closing >= 0) {
					token = template.substring(splits[i]+2, closing);
					isSelfClosing = (token[token.length-1] === options.endTagDelimiter);
					if (isSelfClosing) token = token.substring(0, token.length-1); // Remove the closing slash
					tokens.push([
						true,
						isSelfClosing, // Test if is self-closing
						token
					]);
					token = template.substring(closing+2, splits[i+1]); // todo: refactor: Is this line the same as above ???
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