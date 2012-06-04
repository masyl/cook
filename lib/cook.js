"use strict";

var pathModule = require("path");
var fs = require("fs");
var internals = global["internals"] || require("./middlewares/internals");
var helpers = global["helpers"] || require("./middlewares/helpers");
var tags = global["tags"] || require("./middlewares/tags");
var Template = global["template"] || require("./template");
var Middlewares = global["middlewares"] || require("./middlewares");

/**
 * The main class of the Cook api
 * @constructor
 */
module.exports = function Cook(options) {
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
		if (pathModule && pathModule) {
			var path = pathModule.resolve(this.options.rootPath, _path);
			var buffer = fs.readFileSync(path);
			if (buffer) str = buffer.toString();
		}
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
			.use(internals)
			.use(helpers);

		return template;
	};

	// Add core compile-time middlewares
	this.use(tags);

};
