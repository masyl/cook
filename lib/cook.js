"use strict";

var lexer = require("./lexer"),
	builder = require("./builder"),
	helpers = require("./helpers"),
	options = {
		start: "{",
		end: "}",
		close: "/",
		alt: "-",
		before: "<<",
		after: ">>"
	};

/**
 * Compile a string template into an executable function
 * @param template
 * @return {*}
 */
function cook(template) {
	var tokens, root;
	// Transform the template source string into a series of syntax tokens
	tokens = lexer(template, {
		start: options.start,
		end: options.end,
		close: options.close
	});
	// Build the syntax token into an Abstract Syntax Tree
	root = builder.build(tokens, {
		alt: options.alt,
		after: options.after
	});
	// Return a function that that will be used to render the template
	return function render(data) {
		addInternals(data);
		addHelpers(data);
		return root.render(data)
	};
}

/**
 * Add internal functions and attributes to the scope for later use
 * @param data
 * @return {*}
 */
function addInternals(data) {
	data.$removeWhitespaces = false;
	data.$partials = [];
	data.$partial = function partial(name) {
		return this.$partials[name];
	};
	return data;
}

/**
 * Add default helpers
 * @param data
 * @return {*}
 */
function addHelpers(data) {
	// Load default helpers
	for (var helper in helpers) {
		if (helpers.hasOwnProperty(helper)) {
			data[helper] = helpers[helper];
		}
	}
	return data;
}

cook.options = options;
cook.lexer = lexer;
cook.builder = builder;

module.exports = cook;
