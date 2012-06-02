"use strict";
var pathModule = require("path");
var fs = require("fs");
/**
 * The main class of the Cook api
 * @constructor
 */
function Cook(options) {
	// Keep a self reference to the instance
	var cook = this;

	this.options = options || {
		rootPath: ""
	};

	this.resolve = function (id) {
		return "./" + id + ".cook";
	};

	this.load = function (_path) {
		var str = "";
		var path = pathModule.resolve(this.options.rootPath, _path);
		var buffer = fs.readFileSync(path);
		if (buffer) str = buffer.toString();
		return str;
	};

	this.get = function (name/*, callback*/) {
		var path = this.resolve(name);
		var source = this.load(path);
		return cook.compile(source);
	};

	// Compile-time middleware
	this.middlewares = new Middlewares(this);

	/**
	 * Compile a string template into an executable function
	 * @param source
	 * @return {*}
	 */
	this.compile = function compile(source) {
		// Create a new template instance with the 
		var template = new Template(cook);

		// Run all the compile-time middlewares
		this.middlewares.run(template);

		// Compile the template
		template.compile(source);

		// Add core render-time middlewares
		template
			.use(require("./middlewares/internals"))
			.use(require("./middlewares/helpers"));

		return template;
	};

	// Add core compile-time middlewares
	this.use(require("./middlewares/tags"));

}

/**
 * The template class used to compile source and render models
 * @constructor
 */
function Template(cook) {
	var template = this;

	// The tags available at render-time
	this.tags = {};

	this.source = {
		code: "",
		tokens: [],
		rootTag: null
	};
	this.output = "";

	// Run all the render-time middlewares
	this.middlewares = new Middlewares(this);

	// A dummy template handler, to be replaced once compiled
	this.handler = function () {
		return "";
	};

	/**
	 * Compile source code and set the template handler
	 * @param source
	 */
	this.compile = function (source) {
		template.source.code = source;
		var lexerOptions = {
			start:"{",
			end:"}",
			close:"/",
			chain:">>"
		};
		var lexer = require("./lexer");
		var builder = require("./builder");
		// Transform the template source string into a series of syntax tokens
		var tokens = lexer(source, lexerOptions);
		template.source.tokens = tokens;
		// Build the syntax token into an Abstract Syntax Tree
		var rootTag = builder.build(tokens, this.tags);
		template.source.rootTag = rootTag;
		// Connect the template handler to the render of the root tag
		template.handler = function (context) {
			return rootTag.render(context.stack);
		};
		return template;
	};

	// Return a function that that will be used to render the template
	this.render = function render(model) {
		// Create a new evaluation context instance with the supplied model
		var context = new Context(model);
		// Add the helper used to get a new template from "outside"
		context.root.$get = function (name) {
			return cook.get(name);
		};
		// Add the helper used to load a resource/file from "outside"
		context.root.$load = function (name) {
			return cook.load(name);
		};
		this.middlewares.run(context);
		// Render the template and return its output
		template.output = this.handler(context);
		return template.output;
	};

}

/**
 * The object wrapper around the memory stack used when rendering templates and evaluating expressions
 * A new context is created whenever a template is rendered
 * @param model
 * @constructor
 */
function Context(model) {
	// The stack of closures used to evaluate variables and expressions
	this.stack = [];
	// The bottom most closure of the stack
	this.stack.push(this.root = {});
	// A closure where the user can set global variables
	this.stack.push(this.globals = {});
	// The model object supplied when rendering the template
	this.stack.push(this.model = model);
	// Add mutual reference between the $root closure and the $model closure
	this.model.$root = this.root;
	this.root.$globals = this.globals;
	this.root.$model = this.model;
}

/**
 * Class for adding middlewares to an object
 * @param host
 * @constructor
 */
function Middlewares(host) {
	var self = this;

	// Collection of middlewares
	this.items = [];

	/**
	 * Utility function for adding middlewares to an object
	 * @param middleware
	 */
	this.use = function use(middleware) {
		this.items.push(middleware);
		return this;
	};

	this.run = function apply(target) {
		// Apply the render-time middlewares
		for (var i = 0; i < this.items.length; i++) {
			this.items[i](target);
		}
		return this;
	};

	// Add the .use() shorthand for adding middlewares
	host.use = function (middlewares) {
		return self.use(middlewares);
	}

}

module.exports = Cook;
