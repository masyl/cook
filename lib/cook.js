"use strict";

var lexer = require("./lexer");
var builder = require("./builder");
var internals = require("./middlewares/internals");
var helpers = require("./middlewares/helpers");

function Cook() {
	this.lexer = lexer;
	this.builder = builder;

	this.options = {
		lexer:{
			start:"{",
			end:"}",
			close:"/",
			chain:">>"
		}
	};

	this.middlewares = [internals, helpers];

	this.use = function use(middleware) {
		this.middlewares.push(middleware);
	};

	/**
	 * Compile a string template into an executable function
	 * @param source
	 * @return {*}
	 */
	this.compile = function compile(source) {
		var tokens;
		var root;
		var template;
		// Transform the template source string into a series of syntax tokens
		tokens = this.lexer(source, this.options.lexer);
		// Build the syntax token into an Abstract Syntax Tree
		root = this.builder.build(tokens);
		template = new Template(tokens, root, this.middlewares);
		return template;
	}

}

function Template(tokens, root, middlewares) {
	this.tokens = tokens;
	this.root = root;
	// Return a function that that will be used to render the template
	this.render = function render(model) {
		var i;

		this.context = []; // The stack of closures use to evaluate variables and expressions
		this.root = {}; // The bottom most frame of the context
		this.globals = {}; // A frame where the user can set global variables
		this.model = model; // The model object supplied when rendering the template

		// Add the first set of frames
		this.context.push(this.root);
		this.context.push(this.globals);
		this.context.push(this.model);

		// Add mutual reference between the $root frame and the $model frame
		this.model.$root = this.root;
		this.root.$globals = this.globals;
		this.root.$model = this.model;

		// Apply middlewares
		for (i = 0; i < middlewares.length; i++) {
			middlewares[i](this);
		}


		//todo: figure out if this is even necessary since the "set" and "global" tags cant affect it
		/*
		//Make a shallow copy of the model, to prevent accidental modification of the object
		//with the "set" tag
		var attr;
		for (attr in model) {
			if (model.hasOwnProperty(attr)) {
				this.$model[attr] = model[attr];
			}
		}
		*/

		return root.render(this.context)
	};

}


module.exports = Cook;
