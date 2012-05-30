"use strict";

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

function trimTag(stack, closure) {
	var $root = stack[0];
	var str;
	// Toggle whitespace removal if needed
	$root.$removeWhitespaces = !$root.$removeWhitespaces;
	// Pass on the rendering to the print tag
	str = printTag.call(this, stack, closure);
	// Toggle it back
	$root.$removeWhitespaces = !$root.$removeWhitespaces;
	return str;
}

function printTag(stack, closure) {
	var $root = stack[0];
	var str = "";
	var args = this.args(stack);
	if (this.tags) {
		str = closure.$body = this.tags.render(stack, closure);
	}
	if (args && args.length) {
		str = args.join();
	}
	if ($root.$removeWhitespaces) str = str.trim();
	return str;
}

function voidTag(stack, closure) {
	var args = this.args(stack);
	if (args && args.length) {
		args.join();
	}
	if (this.tags) {
		this.tags.render(stack, closure);
	}
	return "";
}

function applyTag(stack, closure) {
	var output = "",
		fn,
		args;
	if (this.tags) output = this.tags.render(stack, closure);
	closure.$body = output;
	args = this.args(stack);
	if (args && args.length) {

		fn = args[0];
		if (typeof fn === "function") {
			output = fn(output);
		} else {
			output = fn;
		}
	}
	return output;
}

function bindTag(stack, closure) {
	var key,
		$parent = closure.$parent,
		args = this.args(stack);

	if (args && args.length) {
		key = args[0];
		// Push a binding key on the stack
		if (!$parent.$bindings) $parent.$bindings = [];
		$parent.$bindings.push(key);
		// todo: parse body of bind tag and user it as a key
	}
	return "";
}

function elemTag(stack, closure) {
	var attrString = "";
	var str = "";
	var binding = "";
	var args = this.args(stack);
	var elemName;
	var allBindings;

	// todo: support adding tags with the long form "elem 'div'" syntax
	// if (args && args.length) elemName = args.shift();
	elemName = args.shift();
	if (!elemName) elemName = "span";

	if (this.tags) {
		closure.$body = this.tags.render(stack, closure);
	}
	if (args && args.length) {
		str = args.join("");
	} else {
		str = closure.$body;
	}

	// Otherwise build an html tag with possible bindings
	allBindings = [];
	if (closure.$bindings) {
		// Move up the parent closures and collect $bindings
		allBindings = getBindings(stack);

		// Set the binding path on the tag
		binding = " data-binding='" + allBindings.join("::") + "'";
	}


	if (closure.$attrs) {
		for (var attr in closure.$attrs) {
			if (closure.$attrs.hasOwnProperty(attr)) {
				attrString = attrString + " " + attr + "='" + closure.$attrs[attr] + "'";
			}
		}
		closure.$attrs = {};
	}
	return "<" + elemName + binding + attrString + ">" + str + "</" + elemName + ">";
}

//todo: tag handlers should have a "tag" argument to prevent stack ambiguity
function autoTag(stack, closure) {
	var scopeMember;
	var type;
	var constructor;
	var args;

	if (this.autoIsTag) {
		if (stack[0].$templates[this.name]) {
			return renderTag.call(this, stack, closure);
		} else {
			return elemTag.call(this, stack, closure);
		}
	} else {
		// Resolve the arguments and read the type of the first argument
		args = this.args(stack);
		if (args.length) scopeMember = args[0];
		type = typeof scopeMember;

		if (type == "object") {
			constructor = scopeMember.constructor.name;
			if (constructor == "Array") {
				return eachTag.call(this, stack, closure);
			} else if (constructor == "Object") {
				return withTag.call(this, stack, closure);
			} else {
				return printTag.call(this, stack, closure);
			}
		} else if (type == "number" || type == "string") {
			return printTag.call(this, stack, closure);
		} else if (type == "boolean" || type == "undefined") {
			return ifTag.call(this, stack, closure);
		} else if (type == "function") {
			return applyTag.call(this, stack, closure);
		} else {
			return elemTag.call(this, stack, closure);
		}
	}
}


function setTag(stack, closure) {
	var value,
		args = this.args(stack);
	if (args.length > 0) {
		if (this.tags) {
			value = closure.$body = this.tags.render(stack, closure);
		}
		if (args && args.length > 1) {
			value = args[1];
		}
		closure.$parent[args[0]] = value;
	}
	return "";
}

function globalTag(stack, closure) {
	var value,
		args = this.args(stack);
	if (args.length > 0) {
		if (this.tags) {
			value = closure.$body = this.tags.render(stack, closure);
		}
		if (args && args.length > 1) {
			value = args[1];
		}
		closure.$root.$globals[args[0]] = value;
	}
	return "";
}

function withTag(stack, closure) {
	var arg,
		args = this.args(stack);
	if (args && args.length && this.tags) {
		for (var i = 0; i < args.length; i++) {
			arg = args[i];
			for (var key in arg) {
				if (arg.hasOwnProperty(key)) {
					closure[key] = arg[key];
				}
			}
		}
		return this.tags.render(stack, closure);
	}
	return "";
}

function ifTag(stack, closure) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";

	//TODO : THIS WONT WORK!!! $ifContinued should be on the parent closure

	closure.$parent.$ifContinued = true;

	if (this.tags) {
		args = this.args(stack);
		isUndefinedOrTrue = (args === void 0 || args && !!args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(stack, closure);
			closure.$parent.$ifContinued = false;
		}
	}
	return str;
}

function elseTag(stack, closure) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";
	closure.$parent.$ifIsTrue = false;

	//TODO : THIS WONT WORK!!! $ifContinued should be on the parent closure

	if (this.tags && closure.$parent.$ifContinued) {
		args = this.args(stack);
		isUndefinedOrTrue = ((args && args.length === 0) || args && args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(stack, closure);
			closure.$parent.$ifContinued = false;
		}
	}

	return str;
}

function eachTag(stack, closure) {
	var i,
		key,
		source,
		keys = [],
		values = [],
		args,
		valueName,
		str = "";
	if (this.tags) {
		args = this.args(stack);
		source = args.shift();
		valueName = args.shift();
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
					revindex:source.length - i -1,
					key:keys[i],
					isFirst:i == 0,
					isLast:i + 1 === values.length,
					isOdd:!!(i % 2),
					length:source.length,
					value:source[i],
					alternate: function () {
						if (!arguments.length) return "";
						return arguments[this.index % arguments.length];
					}
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
				str = str + this.tags.render(stack, closure);
			}
		}
	}
	return str;
}

/**
 * Tag handler for defining templates for later reuse
 * @param stack
 * @param [closure]
 * @return {String}
 */
function templateTag(stack, closure) {
	var args, name, templateHandler, template;
	if (this.tags) {
		args = this.args(stack);
		if (args && args.length) {
			name = args.shift();
			template = new Template(name, this.tags, args, stack, closure);
			templateHandler = function () {
				// Call render and pass-on the new closure as the "this" object.
				return template.render.apply(this, arguments);
			};
			templateHandler.$isTemplate = true;
			stack[0].$templates[name] = templateHandler;
		}
	}
	return "";
}

function importTag(stack, closure) {
	renderTag.call(this, stack, closure);
	return "";
}

function renderTag(stack, closure) {
	var args;
	var name;
	var template;
	var str = "";
	var $bindings;

	// Render the body BEFORE parsing the arguments
	// This allows for using $body or other vars and internals in arguments
	if (this.tags) closure.$body = this.tags.render(stack, closure);
	args = this.args(stack);
	if (args && args.length) {
		name = args.shift();
		template = stack[0].$templates[name];
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
	}
	return str;
}

function attrTag(stack, closure) {
	var attr;
	var body;
	var args;
	var name;
	var value = "";
	var str = "";
	// Render child tags
	if (!closure.$parent.$attrs) closure.$parent.$attrs = {};
	if (this.tags) body = this.tags.render(stack, closure).trim();
	args = this.args(stack);
	// Pass on any attrs obtained when rendering the tags body
	// This allows chaining attrs tags
	for (attr in closure.$attrs) {
		if (closure.$attrs.hasOwnProperty(attr)) {
			closure.$parent.$attrs[attr] = closure.$attrs[attr];
		}
	}
	// If an argument has been provided, try to set a new attribute
	if (args && args.length) {
		name = args.shift();
		if (args.length) value = args.shift().trim();
		closure.$parent.$attrs[name] = body || value;
	}
	return str;
}

/**
 *
 * @param name
 * @param tags
 * @param argNames
 * @param stack
 * @param closure
 * @constructor
 */
function Template(name, tags, argNames, stack, closure) {
	var template = this;
	this.name = name;
	this.tags = tags;
	this.render = function () {
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


module.exports = function (template) {
	var tags = template.tags;
	tags["elem"] = elemTag;
	tags["auto"] = autoTag;
	tags["void"] = voidTag;
	tags["import"] = importTag;
	tags["print"] = printTag;
	tags["if"] = ifTag;
	tags["else"] = elseTag;
	tags["each"] = eachTag;
	tags["template"] = templateTag;
	tags["render"] = renderTag;
	tags["set"] = setTag;
	tags["global"] = globalTag;
	tags["with"] = withTag;
	tags["bind"] = bindTag;
	tags["apply"] = applyTag;
	tags["attr"] = attrTag;
	tags["trim"] = trimTag;
};

