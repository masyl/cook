"use strict";

function root(data) {
	return this.tags.render(data);
}

function rawTag(data) {
	var str = "",
		args = this.args(data);
	if (args) {
		str = args[0];
		if (data.$removeWhitespaces) str = str.trim();
		return str;
	}
	return "";
}

function printTag(data) {
	var args = this.args(data);
	if (args && args.length > 0) {
		return args.join();
	} else if (this.tags) {
		return this.tags.render(data);
	}
	return "";
}

function applyTag(data) {
	var output = "",
		fn,
		args;
	if (this.tags) output = this.tags.render(data);
	data.$body = output;
	args = this.args(data);
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

function bindTag(data) {
	var key,
		str = "",
		args = this.args(data);

	if (args && args.length > 0) {
		key = args[0];
		// Push a binding key on the stack
		if (!data.$bindings) data.$bindings = [];
		data.$bindings.push(key);
		// Set a marker to tell the next tag to bind itself
		data.$bind = true;

		if (this.tags) {
			str = this.tags.render(data);
		}
	}
	// Pop the binding key that was added earlier
	data.$bindings.pop(key);
	return str;
}

function elemTag(data) {
	var attrString = "", // String use for concatenating element attributes
		scopeMember,
		str = "",
		binding = "",
		args = this.args(data),
		elemName = "span";

	// Otherwise build an html tag with possible bindings
	if (data.$bind) {
		// Set the binding path on the tag
		binding = " data-binding='" + data.$bindings.join("::") + "'";
		data.$bind = false;
	}
	
	if (args && args.length > 0) elemName = args.shift();

	if (args && args.length > 0) {
		str = args.join("");
	} else if (this.tags) {
		// todo: render element body before args are rendered, so that args can process the body
		// this should be a constant approach
		str = this.tags.render(data);
	}
	if (data.$attrs) {
		for (var attr in data.$attrs) {
			attrString = attrString + " " + attr + "='" + data.$attrs[attr] + "'";
		}
		data.$attrs = {};
	}
	return "<" + this.name.substring(1) + binding + attrString + ">" + str + "</" + this.name.substring(1) + ">";
}

//todo: tag handlers should have a "tag" argument to prevent context ambiguity
function autoTag(data) {
	var scopeMember;
	var type;
	var constructor;
	var args;
	var name;

	if (this.autoIsTag) {
		name = this.name.substring(1);
		if (data.$partials[name]) {
			return renderTag.call(this, data);
		} else {
			return elemTag.call(this, data);
		}
	} else {
		// Resolve the arguments and read the type of the first argument
		args = this.args(data);
		if (args.length) scopeMember = args[0];
		type = typeof scopeMember;

		if (type == "object") {
			constructor = scopeMember.constructor.name;
			if (constructor == "Array") {
				return eachTag.call(this, data);
			} else if (constructor == "Object") {
				return withTag.call(this, data);
			} else {
				return printTag.call(this, data);
			}
		} else if (type == "number" || type == "string") {
			return printTag.call(this, data);
		} else if (type == "boolean" || type == "undefined") {
			return ifTag.call(this, data);
		} else if (type == "function") {
			return applyTag.call(this, data);
		} else {
			return elemTag.call(this, data);
		}
	}
}

function varTag(data) {
	var value,
		args = this.args(data);
	if (args && args.length > 1) {
		data[args[0]] = args[1];
	} else if (this.tags && args.length > 0) {
		value = this.tags.render(data);
		data[args[0]] = value;
	}
	return "";
}

function withTag(data) {
	var arg,
		args = this.args(data);
	if (args && args.length > 0 && this.tags) {
		for (var i = 0; i < args.length; i++) {
			arg = args[i];
			for (var key in arg) {
				if (arg.hasOwnProperty(key)) {
					data[key] = arg[key];
				}
			}
		}
		return this.tags.render(data);
	}
	return "";
}

function ifTag(data) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";

	data.$ifContinued = true;

	if (this.tags) {
		args = this.args(data);
		isUndefinedOrTrue = (args === void 0 || args && !!args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(data);
			data.$ifContinued = false;
		}
	}
	return str;
}

function elseTag(data) {
	var args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";
	data.$ifIsTrue = false;

	if (this.tags && data.$ifContinued) {
		args = this.args(data);
		isUndefinedOrTrue = (args === void 0 || args && args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(data);
			data.$ifContinued = false;
		}
	}

	return str;
}

function eachTag(data) {
	var i,
		key,
		source,
		keys = [],
		values = [],
		args,
		valueName,
		str = "";
	if (this.tags) {
		args = this.args(data);
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
				data.$index = i;
				data.$key = keys[i];
				data.$isFirst = i == 0;
				data.$isLast = i + 1 === values.length;
				data.$isOdd = !!(i % 2);
				data.$length = source.length;
				data.$value = source[i];
				if (valueName) {
					data[valueName] = data.$value;
				} else {
					if (typeof data.$value === "object") {
						// Add object attributes to the data scope
						for (var attr in data.$value) {
							if (data.$value.hasOwnProperty(attr)) {
								data[attr] = data.$value[attr];
							}
						}
					}
				}
				str = str + this.tags.render(data);
			}
		}
	}
	return str;
}

/**
 * Tag handler for defining partial templates for later reuse
 * @param data
 * @return {String}
 */
function partialTag(data) {
	var args, name, partial, partialHandler;
	if (this.tags) {
		args = this.args(data);
		if (args && args.length) {
			name = args.shift();
			partial = new Partial(name, this.tags, args, data);
			partialHandler = function () {
				return partial.render.apply(partial, arguments);
			};
			partialHandler.$isPartial = true;
			data.$partials[name] = partialHandler;
		}
	}
	return "";
}

function renderTag(data) {
	var args, name, template, str = "";
	// Render the body BEFORE parsing the arguments
	// This allows for using $body or other vars and internals in arguments
	if (this.tags) data.$body = this.tags.render(data);
	args = this.args(data);
	if (args && args.length) {
		name = args.shift();
		template = data.$partials[name];
		// Collect attributes from the scope and use them as local attributes
		if (data.$attrs) {
			for (var key in data.$attrs) {
				if (data.$attrs.hasOwnProperty(key)) {
					data[key] = data.$attrs[key]
				}
			}
			data.$attrs = {};
		}
		// Test if the called attribute is actually a partial that can be rendered
		if (typeof template === "function" && template.$isPartial) {
			// Render the partial tag
			str = template.apply(data, args || []);
		}
	}
	return str;
}

function attrTag(data) {
	var body, args, name, template, value = "", str = "";
	// Render child tags
	if (!data.$attrs) data.$attrs = {};
	if (this.tags) body = this.tags.render(data).trim();
	args = this.args(data);
	if (args && args.length) {
		name = args.shift();
		if (args.length) value = args.shift().trim();
		data.$attrs[name] = body || value;
	}
	return str;
}

function Partial(name, tags, argNames, data) {
	this.name = name;
	this.tags = tags;
	this.render = function () {
		var output;
		//todo: these attributes should be stacked onto the data
		// Transfer the arguments passed to the partial into named arguments into the data scope
		for (var i = 0; i < argNames.length; i++) {
			if (i < arguments.length) data[argNames[i]] = arguments[i];
		}
		output = this.tags.render(data);
		return output;
	};
}

module.exports = {
	"#root":root,
	"#raw":rawTag,
	"#elem":elemTag,
	"#auto":autoTag,
	"#print":printTag,
	"#if":ifTag,
	"#else":elseTag,
	"#each":eachTag,
	"#partial":partialTag,
	"#render":renderTag,
	"#var":varTag,
	"#with":withTag,
	"#bind":bindTag,
	"#apply":applyTag,
	"#attr":attrTag
};

