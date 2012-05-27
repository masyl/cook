"use strict";

var lexer = require("./lexer");
var builder = require("./builder");
var helpers = require("./helpers");
var options = {
	lexer:{
		start:"{",
		end:"}",
		close:"/",
		chain:">>"
	}
};

/**
 * Compile a string template into an executable function
 * @param template
 * @return {*}
 */
function cook(template) {
	var tokens;
	var root;
	// Transform the template source string into a series of syntax tokens
	tokens = lexer(template, options.lexer);
	// Build the syntax token into an Abstract Syntax Tree
	root = builder.build(tokens);
	// Return a function that that will be used to render the template
	return function render(model) {
		var context = [];
		context.push(addInternals({}));
		context.push(addHelpers({}));
		context.push(model);
		return root.render(context)
	};
}

/**
 * Add internal functions and attributes to the scope for later use
 * @param data
 * @return {*}
 */
function addInternals(data) {
	data.$removeWhitespaces = false;
	data.$partials = {};
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
