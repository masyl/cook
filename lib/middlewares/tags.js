"use strict";

module.exports = function (template) {
	var tags = template.tags;

	/**
	 *
	 * @param name
	 * @param tags
	 * @param argNames
	 * @param stack
	 * @constructor
	 */
	function Template(name, tags, argNames, stack) {
		var template = this;
		this.name = name;
		this.tags = tags;
		this.bindHandler = function bindHandler(closure) {
			return function handler() {
				// Call render and pass-on the new closure as the "this" object.
				return template.render.apply(closure, arguments);
			};
		};
		this.render = function render() {
			var newclosure = this;
			// Transfer the arguments passed to the template into named arguments into the new closure
			for (var i = 0; i < argNames.length; i++) {
				if (i < arguments.length) newclosure[argNames[i]] = arguments[i];
			}
			// Create a new stack and add the new closure to it
			var _stack = stack.slice(0);
			_stack.push(newclosure);
			return template.tags.render(_stack, newclosure);
		};
	}

	/**
	 * Print either an argument or a tags body
	 * @param stack
	 * @param closure
	 * @param value
	 * @return {String}
	 */
	tags["print"] = function printTag(stack, closure, value) {
		if (value !== undefined) {
			return value;
		} else {
			return closure.$body();
		}
	};

	tags["trim"] = function trimTag(stack, closure) {
		var $root = stack[0];
		var str;
		// Toggle whitespace removal if needed
		$root.$removeWhitespaces = !$root.$removeWhitespaces;
		// Pass on the rendering to the print tag
		str = tags["print"].apply(this, arguments);
		// Toggle it back
		$root.$removeWhitespaces = !$root.$removeWhitespaces;
		return str;
	};

	tags["void"] = function voidTag(stack, closure) {
		if (this.tags) {
			closure.$body();
		}
	};

	// todo: Can this behavior be merged with "print" if print would handle a function as a value ?
	tags["apply"] = function applyTag(stack, closure, fn) {
		if (fn !== undefined) {
			if (typeof fn === "function") {
				return fn(closure.$body());
			} else {
				return fn;
			}
		}
	};

	tags["elem"] = function elemTag(stack, closure, name, value) {
		var attrString = "";
		// Obtain the body output and force the execution of attr, set and etc...
		var output = closure.$body() || value || "";
		// todo: support adding tags with the long form "elem 'div'" syntax
		if (!name) name = "span";
		if (closure.$attrs) {
			for (var attr in closure.$attrs) {
				if (closure.$attrs.hasOwnProperty(attr)) {
					attrString = attrString + " " + attr + "='" + closure.$attrs[attr] + "'";
				}
			}
			closure.$attrs = {};
		}
		return "<" + name + attrString + ">" + output + "</" + name + ">";
	};

	tags["set"] = function setTag(stack, closure, key, value) {
		if (value === undefined) {
			value = closure.$body();
		}
		closure.$parent[key] = value;
	};

	tags["global"] = function globalTag(stack, closure, key, value) {
		if (key) {
			value = closure.$body() || value || "";
			closure.$root.$globals[key] = value;
		}
	};

	tags["with"] = function withTag(stack, closure, obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				closure[key] = obj[key];
			}
		}
		return closure.$body();
	};

	tags["if"] = function ifTag(stack, closure, condition) {
		closure.$parent.$ifContinued = true;
		if (this.tags && condition) {
			closure.$parent.$ifContinued = false;
			return closure.$body();
		}
	};

	tags["else"] = function elseTag(stack, closure, condition) {
		// Will be true if there are no arguments or if the first one is "not false" 
		var str = "";
		closure.$parent.$ifIsTrue = false;
		if (this.tags && closure.$parent.$ifContinued) {
			if (condition || condition === undefined) {
				str = closure.$body();
				closure.$parent.$ifContinued = false;
			}
		}
		return str;
	};

	tags["each"] = function eachTag(stack, closure, source, valueName) {
		var i;
		var key;
		var keys = [];
		var values = [];
		var str = "";

		function alternate() {
			if (!arguments.length) return "";
			return arguments[this.index % arguments.length];
		}

		if (this.tags) {
			if (source) {
				if (!(source instanceof Array)) {
					for (key in source) {
						if (source.hasOwnProperty(key)) {
							keys.push(key);
							values.push(source[key]);
						}
					}
					source = values;
				}
				for (i = 0; i < source.length; i++) {
					closure.$loop = {
						index:i,
						revindex:source.length - i - 1,
						key:keys[i],
						isFirst:i == 0,
						isLast:i + 1 === values.length,
						isOdd:!!(i % 2),
						length:source.length,
						value:source[i],
						alternate:alternate
					};

					if (valueName) {
						closure[valueName] = closure.$loop.value;
					} else {
						if (typeof closure.$loop.value === "object") {
							// Add object attributes to the closure
							for (var attr in closure.$loop.value) {
								if (closure.$loop.value.hasOwnProperty(attr)) {
									closure[attr] = closure.$loop.value[attr];
								}
							}
						}
					}
					str = str + closure.$body();
				}
			}
		}
		return str;
	};

	/**
	 * Tag handler for defining templates for later reuse
	 * @param stack
	 * @param [closure]
	 * @return {String}
	 */
	tags["template"] = function templateTag(stack, closure, name) {
		var template;
		var handler;
		var args = new Array().slice.call(arguments, 3);

		if (this.tags && name) {
			template = new Template(name, this.tags, args, stack);
			handler = template.bindHandler(closure);
			stack[0].$templates[name] = handler;
		}
		return "";
	};

	tags["render"] = function renderTag(stack, closure, name) {
		var args;
		var handler;
		var template;
		var externalTemplate;
		var str = "";

		args = new Array().slice.call(arguments, 3);

		// Fetch either a local or external template
		handler = stack[0].$templates[name];
		// If the template does not exist in the stored templates and must be compiled first
		if (!handler) {
			// todo: handle exceptions
			externalTemplate = stack[0].$get(name);
			template = new Template(name, externalTemplate.source.rootTag.tags, [], stack);
			handler = template.bindHandler(closure);
			stack[0].$templates[name] = handler;
		}

		// Compile the body
		closure.$body();

		// Collect attributes from the scope and use them as local attributes
		if (closure.$attrs) {
			for (var key in closure.$attrs) {
				if (closure.$attrs.hasOwnProperty(key)) {
					closure[key] = closure.$attrs[key]
				}
			}
			closure.$attrs = {};
		}

		// Test if the called attribute is actually a function
		if (typeof handler === "function") {
			// Render the template tag with the new closure
			str = handler.apply(closure, args || []);
		}

		return str;
	};

	tags["import"] = function importTag(stack, closure) {
		tags["render"].apply(this, arguments);
	};

	tags["attr"] = function attrTag(stack, closure, name, value) {
		var attr;
		// Render the body in order to hoist any attrs it might contain
		var body = closure.$body();
		if (!closure.$parent.$attrs) closure.$parent.$attrs = {};
		// Pass on any attrs obtained when rendering the tags body
		// This allows chaining attrs tags
		for (attr in closure.$attrs) {
			if (closure.$attrs.hasOwnProperty(attr)) {
				closure.$parent.$attrs[attr] = closure.$attrs[attr];
			}
		}
		// If an argument has been provided, try to set a new attribute
		if (name) {
			closure.$parent.$attrs[name] = body || value || "";
		}
	};

	//todo: tag handlers should have a "tag" argument to prevent stack ambiguity
	tags["auto"] = function autoTag(stack, closure, scopeMember) {
		var type;
		var constructor;
		if (this.autoIsTag) {
			if (stack[0].$templates[this.name]) {
				return tags["render"].apply(this, arguments);
			} else {
				return tags["elem"].apply(this, arguments);
			}
		} else {
			// Resolve the arguments and read the type of the first argument
			type = typeof scopeMember;
			if (type == "object") {
				constructor = scopeMember.constructor.name;
				if (constructor == "Array") {
					return tags["each"].apply(this, arguments);
				} else if (constructor == "Object") {
					return tags["with"].apply(this, arguments);
				} else {
					return tags["print"].apply(this, arguments);
				}
			} else if (type == "number" || type == "string") {
				return tags["print"].apply(this, arguments);
			} else if (type == "boolean" || type == "undefined") {
				return tags["if"].apply(this, arguments);
			} else if (type == "function") {
				return tags["apply"].apply(this, arguments);
			} else {
				return tags["elem"].apply(this, arguments);
			}
		}
	};
};
