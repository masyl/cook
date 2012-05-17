"use strict";

function rootTag(data) {
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

function filterTag(data) {
	var output = "",
		filter,
		args;
	if (this.tags) output = this.tags.render(data);
	data.$body = output;
	args = this.args(data);
	if (args && args.length > 0) {

		filter = args[0];
		if (typeof filter === "function") {
			output = filter(output);
		} else {
			output = filter;
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

function defaultTag(data) {
	var scopeMember,
		str = "",
		binding = "",
		args = this.args(data);


	scopeMember = data[this.name];
	// If the tag name points to a scope members, use this
	if (scopeMember) {
		if (this.tags) str = this.tags.render(data);
		data.$body = str;

		if (typeof scopeMember === "function") {
			if (scopeMember.$isPartial) {
				return scopeMember.apply(data, args);
			} else {
				return scopeMember(str);
			}
		} else {
			return scopeMember;
		}		
	} else {
		// Otherwise build an html tag with possible bindings
		if (data.$bind) {
			// Set the binding path on the tag
			binding = " data-binding='" + data.$bindings.join("::") + "'";
			data.$bind = false;
		}
		if (args && args.length > 0) {
			str = args.join();
		} else if (this.tags) {
			str = this.tags.render(data);
		}
		return "<" + this.name + binding + ">" + str + "</" + this.name + ">";
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
	var i, args,
		isUndefinedOrTrue, // Will be true if there are no arguments or if the first one is "not false" 
		str = "";

	data.$ifContinued = true;

	if (this.tags) {
		args = this.args(data);
		isUndefinedOrTrue = (args === void 0 || args && args[0]);
		if (isUndefinedOrTrue) {
			str = this.tags.render(data);
			data.$ifContinued = false;
		}
	}
	return str;
}

function elseTag(data) {
	var i, args,
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
		str = "";
	if (this.tags) {
		args = this.args(data);
		if (args && args.length) {
			source = args[0];
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
				data.$value = source[i];
				data.$isFirst = i == 0;
				data.$isLast = i+1 === values.length;
				data.$isOdd = !!(i % 2);
				data.$length = source.length;
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
			data["$" + name] = partialHandler;
		}
	}
	return "";
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
	"root": rootTag,
	"raw": rawTag,
	"print": printTag,
	"if": ifTag,
	"else": elseTag,
	"each": eachTag,
	"partial": partialTag,
	"var": varTag,
	"with": withTag,
	"default": defaultTag,
	"bind": bindTag,
	"filter": filterTag
};

