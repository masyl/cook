"use strict";

/**
 * Utility function to move up the parent frames and collect all the $bindings
 * @param context
 * @return {Array}
 */
function getBindings(context) {
	var i;
	var j;
	var bindings;
	var allBindings = [];
	for (i = 0; i < context.length; i++) {
		bindings = context[i].$bindings;
		if (bindings) {
			for (j = 0; j < bindings.length; j++) {
				allBindings.push(bindings[j]);
			}
		}
	}
	return allBindings;
}

function trimTag(context, frame) {
	var $root = context[0];
	var str;
	// Toggle whitespace removal if needed
	$root.$removeWhitespaces = !$root.$removeWhitespaces;
	// Pass on the rendering to the print tag
	str = printTag.call(this, context, frame);
	// Toggle it back
	$root.$removeWhitespaces = !$root.$removeWhitespaces;
	return str;
}

function printTag(context, frame) {
	var $root = context[0];
	var str = "";
	var args = this.args(context);
	if (this.tags) {
		str = frame.$body = this.tags.render(context, frame);
	}
	if (args && args.length) {
		str = args.join();
	}
	if ($root.$removeWhitespaces) str = str.trim();
	return str;
}

function voidTag(context, frame) {
	var args = this.args(context);
	if (args && args.length) {
		args.join();
	}
	if (this.tags) {
		this.tags.render(context, frame);
	}
	return "";
}

function applyTag(context, frame) {
	var output = "",
		fn,
		args;
	if (this.tags) output = this.tags.render(context, frame);
	frame.$body = output;
	args = this.args(context);
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

function bindTag(context, frame) {
	var key,
		$parent = frame.$parent,
		args = this.args(context);

	if (args && args.length) {
		key = args[0];
		// Push a binding key on the stack
		if (!$parent.$bindings) $parent.$bindings = [];
		$parent.$bindings.push(key);
		// todo: parse body of bind tag and user it as a key
	}
	return "";
}

function elemTag(context, frame) {
	var attrString = "";
	var str = "";
	var binding = "";
	var args = this.args(context);
	var elemName;
	var allBindings;

	// todo: support adding tags with the long form "elem 'div'" syntax
	// if (args && args.length) elemName = args.shift();
	elemName = args.shift();
	if (!elemName) elemName = "span";

	if (this.tags) {
		frame.$body = this.tags.render(context, frame);
	}
	if (args && args.length) {
		str = args.join("");
	} else {
		str = frame.$body;
	}

	// Otherwise build an html tag with possible bindings
	allBindings = [];
	if (frame.$bindings) {
		// Move up the parent frames and collect $bindings
		allBindings = getBindings(context);

		// Set the binding path on the tag
		binding = " data-binding='" + allBindings.join("::") + "'";
	}


	if (frame.$attrs) {
		for (var attr in frame.$attrs) {
			if (frame.$attrs.hasOwnProperty(attr)) {
				attrString = attrString + " " + attr + "='" + frame.$attrs[attr] + "'";
			}
		}
		frame.$attrs = {};
	}
	return "<" + elemName + binding + attrString + ">" + str + "</" + elemName + ">";
}

//todo: tag handlers should have a "tag" argument to prevent context ambiguity
function autoTag(context, frame) {
	var scopeMember;
	var type;
	var constructor;
	var args;

	if (this.autoIsTag) {
		if (context[0].$partials[this.name]) {
			return renderTag.call(this, context, frame);
		} else {
			return elemTag.call(this, context, frame);
		}
	} else {
		// Resolve the arguments and read the type of the first argument
		args = this.args(context);
		if (args.length) scopeMember = args[0];
		type = typeof scopeMember;

		if (type == "object") {
			constructor = scopeMember.constructor.name;
			if (constructor == "Array") {
				return eachTag.call(this, context, frame);
			} else if (constructor == "Object") {
				return withTag.call(this, context, frame);
			} else {
				return printTag.call(this, context, frame);
			}
		} else if (type == "number" || type == "string") {
			return printTag.call(this, context, frame);
		} else if (type == "boolean" || type == "undefined") {
			return ifTag.call(this, context, frame);
		} else if (type == "function") {
			return applyTag.call(this, context, frame);
		} else {
			return elemTag.call(this, context, frame);
		}
	}
}

function setTag(context, frame) {
	var value,
		args = this.args(context);
	if (args && args.length > 1) {
		frame.$parent[args[0]] = args[1];
	} else if (this.tags && args.length > 0) {
		value = this.tags.render(context, frame);
		frame.$parent[args[0]] = value;
	}
	return "";
}

function withTag(context, frame) {
	var arg,
		args = this.args(context);
	if (args && args.length && this.tags) {
		for (var i = 0; i < args.length; i++) {
			arg = args[i];
			for (var key in arg) {
				if (arg.hasOwnProperty(key)) {
					frame[key] = arg[key];
				}
			}
		}
		return this.tags.render(context, frame);
	}
	return "";
}

function ifTag(context, frame) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";

	//TODO : THIS WONT WORK!!! $ifContinued should be on the parent frame

	frame.$parent.$ifContinued = true;

	if (this.tags) {
		args = this.args(context);
		isUndefinedOrTrue = (args === void 0 || args && !!args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(context, frame);
			frame.$parent.$ifContinued = false;
		}
	}
	return str;
}

function elseTag(context, frame) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";
	frame.$parent.$ifIsTrue = false;

	//TODO : THIS WONT WORK!!! $ifContinued should be on the parent frame

	if (this.tags && frame.$parent.$ifContinued) {
		args = this.args(context);
		isUndefinedOrTrue = ((args && args.length === 0) || args && args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(context, frame);
			frame.$parent.$ifContinued = false;
		}
	}

	return str;
}

function eachTag(context, frame) {
	var i,
		key,
		source,
		keys = [],
		values = [],
		args,
		valueName,
		str = "";
	if (this.tags) {
		args = this.args(context);
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
				frame.$loop = {
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
					frame[valueName] = frame.$loop.value;
				} else {
					if (typeof frame.$loop.value === "object") {
						// Add object attributes to the frame
						for (var attr in frame.$loop.value) {
							if (frame.$loop.value.hasOwnProperty(attr)) {
								frame[attr] = frame.$loop.value[attr];
							}
						}
					}
				}
				str = str + this.tags.render(context, frame);
			}
		}
	}
	return str;
}

/**
 * Tag handler for defining partial templates for later reuse
 * @param context
 * @param [frame]
 * @return {String}
 */
function partialTag(context, frame) {
	var args, name, partial, partialHandler;
	if (this.tags) {
		args = this.args(context);
		if (args && args.length) {
			name = args.shift();
			partial = new Partial(name, this.tags, args, context, frame);
			partialHandler = function () {
				// Call render and pass-on the new frame as the "this" object.
				return partial.render.apply(this, arguments);
			};
			partialHandler.$isPartial = true;
			context[0].$partials[name] = partialHandler;
		}
	}
	return "";
}

function renderTag(context, frame) {
	var args;
	var name;
	var template;
	var str = "";
	var $bindings;

	// Render the body BEFORE parsing the arguments
	// This allows for using $body or other vars and internals in arguments
	if (this.tags) frame.$body = this.tags.render(context, frame);
	args = this.args(context);
	if (args && args.length) {
		name = args.shift();
		template = context[0].$partials[name];
		// Collect attributes from the scope and use them as local attributes
		if (frame.$attrs) {
			for (var key in frame.$attrs) {
				if (frame.$attrs.hasOwnProperty(key)) {
					frame[key] = frame.$attrs[key]
				}
			}
			frame.$attrs = {};
		}
		// Test if the called attribute is actually a partial that can be rendered
		if (typeof template === "function" && template.$isPartial) {
			// Import the bindings from the parent frames
			$bindings = getBindings(context);
			if ($bindings.length) frame.$bindings = $bindings;
			// Render the partial tag with the new frame
			str = template.apply(frame, args || []);
		}
	}
	return str;
}

function attrTag(context, frame) {
	var attr;
	var body;
	var args;
	var name;
	var value = "";
	var str = "";
	// Render child tags
	if (!frame.$parent.$attrs) frame.$parent.$attrs = {};
	if (this.tags) body = this.tags.render(context, frame).trim();
	args = this.args(context);
	// Pass on any attrs obtained when rendering the tags body
	// This allows chaining attrs tags
	for (attr in frame.$attrs) {
		if (frame.$attrs.hasOwnProperty(attr)) {
			frame.$parent.$attrs[attr] = frame.$attrs[attr];
		}
	}
	// If an argument has been provided, try to set a new attribute
	if (args && args.length) {
		name = args.shift();
		if (args.length) value = args.shift().trim();
		frame.$parent.$attrs[name] = body || value;
	}
	return str;
}

/**
 *
 * @param name
 * @param tags
 * @param argNames
 * @param context
 * @param frame
 * @constructor
 */
function Partial(name, tags, argNames, context, frame) {
	var partial = this;
	this.name = name;
	this.tags = tags;
	this.render = function () {
		var newFrame = this;
		// Transfer the arguments passed to the partial into named arguments into the new frame
		for (var i = 0; i < argNames.length; i++) {
			if (i < arguments.length) newFrame[argNames[i]] = arguments[i];
		}
		// Create a new context and add the new frame to it
		var _context = context.slice(0);
		_context.push(newFrame);
		return partial.tags.render(_context, newFrame);
	};
}

module.exports = {
	"elem":elemTag,
	"auto":autoTag,
	"void":voidTag,
	"print":printTag,
	"if":ifTag,
	"else":elseTag,
	"each":eachTag,
	"partial":partialTag,
	"render":renderTag,
	"set":setTag,
	"with":withTag,
	"bind":bindTag,
	"apply":applyTag,
	"attr":attrTag,
	"trim":trimTag
};

