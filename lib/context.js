
/**
 * The object wrapper around the memory stack used when rendering templates and evaluating expressions
 * A new context is created whenever a template is rendered
 * @constructor
 * @param model
 * @param mode Rendering mode : text, object, dom
 * @param document HTMLDocument (used for "dom" rendering mode
 */
module.exports = function Context(model, mode, document) {
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
	this.root.$mode = mode || "text";
	this.root.$document = document;
};
