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
	return function render(_model) {
		var context = [];
		//todo: a copy of the model should be created, instead of the model itself.
		var $model = _model;
		var $root = addInternals(addHelpers({}));
		// Add mutual reference between the $root frame and the $model frame
		$model.$root = $root;
		$root.$model = $model;
		// Create a root frame
		context.push($root);
		// Add the user's model as the first frame over the root
		context.push($model);
		return root.render(context)
	};
}

/**
 * Populate a frame with internal functions and attributes to the scope for later use
 * @param frame
 * @return {*}
 */
function addInternals(frame) {
	frame.$removeWhitespaces = false;
	frame.$partials = {};
	return frame;
}

/**
 * Populate a frame with default helpers
 * @param frame
 * @return {*}
 */
function addHelpers(frame) {
	// Load default helpers
	for (var helper in helpers) {
		if (helpers.hasOwnProperty(helper)) {
			frame[helper] = helpers[helper];
		}
	}
	return frame;
}

cook.options = options;
cook.lexer = lexer;
cook.builder = builder;

module.exports = cook;
