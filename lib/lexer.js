"use strict";

function escapeDoubleCurlies(str) {
	return str.replace(/{{/g, "❰").replace(/}}/g, "❱")
}
function unescapeDoubleCurlies(str) {
	return str.replace(/❰/g, "{").replace(/❱/g, "}")
}

/**
 * Lexing function that break up a template string source into syntactic tokens
 * @param template
 * @param options
 * @return {Array}
 */
module.exports = function lexer(template, options) {
	var i;
	var j;
	var closing;
	var token;
	var tokens = [];
	var splits = [];
	var chainedTokens = [];
	var isSelfClosingTag;
	var isChained = false;
	template = escapeDoubleCurlies(template);
	// Find all occurences of start delimiters
	if (template) {
		for (i = template.indexOf(options.start); i >= 0; i = template.indexOf(options.start, i + 1)) {
			splits.push(i);
		}
		// Add a last marker for the end of the template
		splits.push(template.length);
		// Add the first token (from 0 to first start)
		tokens.push([
			isChained,
			false, // If token is inside a tag or outside
			false,
			unescapeDoubleCurlies(template.substring(0, splits[0]))
		]);
		for (i = 0; i < splits.length; i++) {
			closing = template.indexOf(options.end, splits[i]);
			if (closing >= 0) {
				token = template.substring(splits[i] + options.start.length, closing);

				// Extract Chained Tag syntax, if no chaining exist it will
				// only contain a single item
				chainedTokens = token.split(options.chain);
				for (j = 0; j < chainedTokens.length; j++) {
					isChained = chainedTokens.length > 1 && j !== chainedTokens.length - 1;
					token = chainedTokens[j].trim();

					isSelfClosingTag = (token[token.length - 1] === options.close) && token.length > 1;
					if (isSelfClosingTag) token = token.substring(0, token.length - 1); // Remove the closing slash
					tokens.push([
						isChained,
						true,
						isSelfClosingTag, // Test if is self-closing
						unescapeDoubleCurlies(token)
					]);
				}
				// Add the raw token after the end delimiter "}"
				isChained = false;
				token = template.substring(closing + options.end.length, splits[i + 1]);
				tokens.push([
					isChained,
					false,
					false,
					unescapeDoubleCurlies(token)
				]);

			}
		}
	}
	return tokens;
};


