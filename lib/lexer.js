"use strict";

/**
 * Lexing function that break up a template string source into syntactic tokens
 * @param template
 * @param options
 * @return {Array}
 */
module.exports = function lexer(template, options) {
	var
		i,
		closing,
		token,
		tokens = [],
		splits = [],
		isSelfClosing;
	// Find all occurences of start delimiters
	if (template) {
		for (i = template.indexOf(options.start); i >= 0; i = template.indexOf(options.start, i + 1)) {
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
			closing = template.indexOf(options.end, splits[i]);
			if (closing >= 0) {
				token = template.substring(splits[i] + options.start.length, closing);
				isSelfClosing = (token[token.length - 1] === options.close);
				if (isSelfClosing) token = token.substring(0, token.length - 1); // Remove the closing slash
				tokens.push([
					true,
					isSelfClosing, // Test if is self-closing
					token
				]);
				token = template.substring(closing + options.end.length, splits[i + 1]);
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


