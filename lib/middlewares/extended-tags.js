"use strict";

module.exports = function (template) {
	var tags = template.tags;

	/**
	 * Utility function to move up the parent closures and collect all the $bindings
	 * @param stack
	 * @return {Array}
	 */
	function getBindings(stack) {
		var i;
		var j;
		var bindings;
		var allBindings = [];
		for (i = 0; i < stack.length; i++) {
			bindings = stack[i].$bindings;
			if (bindings) {
				for (j = 0; j < bindings.length; j++) {
					allBindings.push(bindings[j]);
				}
			}
		}
		return allBindings;
	}

	tags["bind"] = function bindTag(stack, closure, key) {
		var $parent = closure.$parent;
		if (key) {
			// Push a binding key on the stack
			if (!$parent.$bindings) $parent.$bindings = [];
			$parent.$bindings.push(key);
		}
	};


	tags["elem"] = function elemTag(stack, closure, name, value) {
		var attrString = "";
		var binding = "";
		var bindings = [];
		// Obtain the body output and force the execution of attr, set and etc...
		var output = closure.$body() || value || "";
		// todo: support adding tags with the long form "elem 'div'" syntax
		if (!name) name = "span";
		if (closure.$bindings) {
			// Move up the parent closures and collect $bindings
			bindings = getBindings(stack);
			// Set the binding path on the tag
			binding = " data-binding='" + bindings.join("::") + "'";
		}
		if (closure.$attrs) {
			for (var attr in closure.$attrs) {
				if (closure.$attrs.hasOwnProperty(attr)) {
					attrString = attrString + " " + attr + "='" + closure.$attrs[attr] + "'";
				}
			}
			closure.$attrs = {};
		}
		return "<" + name + binding + attrString + ">" + output + "</" + name + ">";
	};

	tags["render"] = function renderTag(stack, closure, name) {
		var args;
		var template;
		var str = "";
		var $bindings;

		args = new Array().slice.call(arguments, 3);
		template = stack[0].$templates[name];
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
		// Test if the called attribute is actually a template that can be rendered
		if (typeof template === "function" && template.$isTemplate) {
			// Import the bindings from the parent closures
			$bindings = getBindings(stack);
			if ($bindings.length) closure.$bindings = $bindings;
			// Render the template tag with the new closure
			str = template.apply(closure, args || []);
		}

		return str;
	};


};

