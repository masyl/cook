"use strict";

function root(context, frame) {
	return this.tags.render(context, frame);
}

function rawTag(context) {
	var str = "";
	var $root = context[0];
	var args = this.args(context);
	if (args) {
		str = args[0];
		if ($root.$removeWhitespaces) str = str.trim();
		return str;
	}
	return "";
}

function printTag(context, frame) {
	var args = this.args(context);
	if (args && args.length > 0) {
		return args.join();
	} else if (this.tags) {
		return this.tags.render(context, frame);
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
	if (args && args.length > 0) {

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
		str = "",
		$root = context[0],
		args = this.args(context);

	if (args && args.length > 0) {
		key = args[0];
		// Push a binding key on the stack
		if (!$root.$bindings) $root.$bindings = [];
		$root.$bindings.push(key);
		// Set a marker to tell the next tag to bind itself
		$root.$bind = true;

		if (this.tags) {
			str = this.tags.render(context, frame);
		}
	}
	// Pop the binding key that was added earlier
	$root.$bindings.pop(key);
	return str;
}

function elemTag(context, frame) {
	var attrString = "";
	var str = "";
	var binding = "";
	var args = this.args(context);
	var $root = context[0];
	var elemName;

	// Otherwise build an html tag with possible bindings
	if ($root.$bind) {
		// Set the binding path on the tag
		binding = " data-binding='" + $root.$bindings.join("::") + "'";
		$root.$bind = false;
	}

	// todo: support adding tags with the long form "elem 'div'" syntax
	// if (args && args.length > 0) elemName = args.shift();
	elemName = args.shift();
	if (!elemName) elemName = "span";
	
	if (args && args.length > 0) {
		str = args.join("");
	} else if (this.tags) {
		// todo: render element body before args are rendered, so that args can process the body
		// this should be a constant approach
		str = this.tags.render(context, frame);
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
	if (args && args.length > 0 && this.tags) {
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
				frame.$index = i;
				frame.$key = keys[i];
				frame.$isFirst = i == 0;
				frame.$isLast = i + 1 === values.length;
				frame.$isOdd = !!(i % 2);
				frame.$length = source.length;
				frame.$value = source[i];
				if (valueName) {
					frame[valueName] = frame.$value;
				} else {
					if (typeof frame.$value === "object") {
						// Add object attributes to the frame
						for (var attr in frame.$value) {
							if (frame.$value.hasOwnProperty(attr)) {
								frame[attr] = frame.$value[attr];
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
	var args, name, template, str = "";
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
			// Render the partial tag
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
	"root":root,
	"raw":rawTag,
	"elem":elemTag,
	"auto":autoTag,
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
	"attr":attrTag
};

