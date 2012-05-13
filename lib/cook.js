"use strict";
(function () {
	var lexer = require("./lexer"),
		builder = require("./builder"),
		tags,
		options = {
			start: "{",
			end: "}",
			close: "/",
			alt: "-",
			before: "<<",
			after: ">>"
		};

	/**
	 * Render a template into an executable function
	 * @param template
	 * @return {*}
	 */
	function cook(template) {
		var tokens, root;
		tokens = lexer(template, {
			start: options.start,
			end: options.end,
			close: options.close
		});
		root = builder.build(tokens, {
			alt: options.alt,
			after: options.after
		});
		return function render(data) {
			addInternals(data);
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
		// $Array is used internally for compiling a funex with multiple arguments
		data.$Array = function () {
			return Array.prototype.slice.call(arguments, 0);
		};
		data.encodeURI = encodeURI;
		data.decodeURI = decodeURI;
		data.encodeURIComponent = encodeURIComponent;
		data.decodeURIComponent = decodeURIComponent;
		data.$log = function($body) {
			console.log.apply(console, arguments);
			return $body;
		};
		data.$partials = [];
		data.$partial = function partial(name) {
			return this.$partials[name];
		};

		return data;
	}

	//todo: ensure this is scoped properly and not global
	var partials = {};

	/**
	 * Get an options value
	 * @param attr
	 * @return {*}
	 */
	function get (attr) {
		return options[attr];
	}

	/**
	 * Set an options value
	 * @param attr
	 * @param value
	 * @return {*}
	 */
	function set (attr, value) {
		options[attr] = value;
		return options[attr];
	}


	cook.lexer = lexer;
	cook.builder = builder;
	cook.get = get;
	cook.set = set;

	module.exports = cook;

})();