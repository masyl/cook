module.exports = function (cook) {

	var Middlewares = global["middlewares"] || require("./middlewares");
	var Context = global["context"] || require("./context");
	var lexer = global["lexer"] || require("./lexer");
	var builder = global["builder"] || require("./builder");
	builder = builder(cook);
	
	/**
	 * The template class used to compile source and render models
	 * @constructor
	 */
	return function Template(cook) {
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
			// Transform the template source string into a series of syntax tokens
			var tokens = lexer(source, lexerOptions);
			template.source.tokens = tokens;
			// Build the syntax token into an Abstract Syntax Tree
			var rootTag = builder(tokens, this.tags);
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
	
	};
};