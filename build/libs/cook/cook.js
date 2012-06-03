

	(function (global) {
		function Package(global) {
			function Require(context, global) {
	var self = this;
	this.modules = [];
	function require(key) {
		return self.modules[key];
	}
	require.import = function (key, module) {
		self.modules[key] = module;
		global[key] = module;
	};
	return require;
}

	

			var module = {
				exports: {}
			};
			var require = new Require(this, global);


			
	
	/*******************************************************************
	 * Loading: funex
	 * Source: 
	 */
	
	(function () {
	var undefined = void 0;
	// Declare constants for state names
	var __default = 99;
	var __callOpen = 3;
	var __callClose = 4;
	var __arrayOpen = 5;
	var __arrayClose = 6;
	var __dot = 7;
	var __argsSeparator = 8;
	var __whitespace = 9;
	var __string = 10;
	var __numeric = 11;
	var __name = 12;
	var __charMapNumericStart = "1234567890-";
	var __charMapNumeric = __charMapNumericStart + ".";
	var __charMapAlpha = "abcdefghijklmnopqrstuvwxyz";
	var __charMapAlphaExtended = __charMapAlpha + __charMapAlpha.toUpperCase() + "_$";
	var __charMapAlphaExtendedContinued = __charMapAlphaExtended + __charMapNumericStart;
	var stateChars = {
		"(":__callOpen,
		")":__callClose,
		"[":__arrayOpen,
		"]":__arrayClose,
		".":__dot,
		",":__argsSeparator,
		" ":__whitespace,
		"'":__string
	};

	/**
	 * Compile a funex string expression into a executable function
	 * @param exp
	 */
	module.exports = function (exp) {
		var tokens = tokenizer(exp);
		return function (context) {
			// If no context was provided, create an empty one.
			if (typeof context === "undefined") context = [
				{}
			];
			//If the context is not already an array, create a one-level stack
			if (context.constructor.name !== "Array") context = [context];
			return executeTokens(tokens, context);
		};
	};

	/**
	 * Execute the instructions dictated by code tokens
	 * @param tokens
	 * @param context
	 */
	function executeTokens(tokens, context) {
		var i;
		var j;
		var s0;
		var token;
		var tokenStr;
		var args;
		var frame;
		var value = undefined;
		var valueParent = context[0];
		var state;
		var callee;
		var parsedStr = "";
		var stack = [
			[context[0]]
		];
		var __function = "function";
		var __illegalCall = "Illegal call : ";
		var __syntaxError = "Syntax error : ";

		for (i = 0; i < tokens.length; i++) {
			s0 = stack[0];
			token = tokens[i];
			tokenStr = token[0];
			state = token[1];
			parsedStr += tokenStr;
			switch (state) {
				case __default:
					throw __syntaxError + parsedStr;
				case  __callOpen:
					// Add a fresh context in the stack
					args = [context[0]];
					args._ = true;
					args.c = value; // Callee
					args.cP = valueParent; // CalleeParent
					stack.unshift(args);
					value = undefined;
					valueParent = context[0];
					break;
				case __callClose:
					// Pop the stack and then call the new stack head
					// with the popped value
					args = stack.shift();
					callee = args.c;
					if (!args._)
						throw __syntaxError + __illegalCall + parsedStr;
					if (callee !== context[0]) { // Prevent an array call on undefined
						// Reverse the argument into the correct order
						if (typeof callee !== __function)
							throw "Type error: " + typeof(callee) + " is not a " + __function + " : " + parsedStr;
						stack[0][0] = callee.apply(args.cP, args.reverse());
						value = stack[0][0];
					} else
						throw __syntaxError + __illegalCall + parsedStr;
					break;
				case __arrayOpen:
					stack.unshift([context[0]]);
					value = undefined;
					valueParent = context[0];
					break;
				case __arrayClose:
					// Pop the stack and then call the new stack head
					// as an array with the popped value
					value = stack.shift();
					s0 = stack[0];
					// Prevent an array call on the root context
					if (s0[0] === context[0])
						throw __syntaxError + __illegalCall + parsedStr;
					// Prevent an array call on undefined
					if (s0[0] === undefined)
						throw "Cannot read property '" + tokenStr + "' of undefined : " + parsedStr;
					// Read the new value
					value = s0[0][ value[0] ];
					s0[0] = value;
					break;
				case __dot:
					valueParent = value;
					value = undefined;
					break;
				case __argsSeparator:
					value = undefined;
					valueParent = context[0];
					//todo: check if the argSeparator is used in a correct setting
					if (!s0._)
						throw __syntaxError + parsedStr;
					// If the first argument was never set, set as undefined
					if (s0[0] === context[0])
						s0[0] = undefined;
					s0.unshift(context[0]);
					break;
				case __string:
					s0[0] = value = tokenStr;
					break;
				case __numeric:
					s0[0] = value = parseFloat(tokenStr);
					break;
				case __name:
					// If the name is resolved on the global context
					// Try to resolve in across the stack
					if (s0[0] === context[0]) {
						value = undefined;
						for (j = 0; j < context.length; j++) {
							frame = context[j];
							if ((frame !== undefined) && (tokenStr in frame))
								value = frame[tokenStr];
						}
						s0[0] = value;
					} else {
						// Else resolve it on the current value
						if (s0[0] === undefined)
							throw "Cannot read property '" + tokenStr + "' of undefined : " + parsedStr;
						// TODO: RESOLVE NAME ON CONTEXT STACK
						value = s0[0][tokenStr];
						s0[0] = value;
					}
			}
		}
		s0 = stack[0];
		return (s0 === context[0]) ? undefined : s0[0];
	}

	/**
	 * Parse a funex string into a stack of tokens
	 * @param exp
	 */
	function tokenizer(exp) {
		var i;
		var chr;
		var instructions = [];
		var newState;
		var token = "";
		var state = __default;
		var tokenIsOneChar;

		for (i = 0; i < exp.length; i++) {
			chr = exp[i];
			newState = undefined;
			tokenIsOneChar = (token.length == 1);
			switch (state) {
				case __default:
					newState = stateChars[chr];
					if (newState !== undefined) break;
					if (__charMapNumericStart.indexOf(chr) + 1) {
						newState = __numeric;
						break;
					}
					if (__charMapAlphaExtended.indexOf(chr) + 1)
						newState = __name;
					break;
				case  __callOpen:
					if (chr != "(" || tokenIsOneChar) newState = __default;
					break;
				case __callClose:
					if (chr != ")" || tokenIsOneChar) newState = __default;
					break;
				case __arrayOpen:
					if (chr != "[" || tokenIsOneChar) newState = __default;
					break;
				case __arrayClose:
					if (chr != "]" || tokenIsOneChar) newState = __default;
					break;
				case __dot:
					if (chr != "." || tokenIsOneChar) newState = __default;
					break;
				case __argsSeparator:
					if (chr != "," || tokenIsOneChar) newState = __default;
					break;
				case __whitespace:
					// todo: add other whitespace codes
					if (chr != " ") newState = __default;
					break;
				case __string:
					// If the last char is a "'" and not the first char
					if (chr == "'" && token.length > 1) {
						// TODO: CODE NEVER GETS HERE!?!?!?!
						token = token.substring(1);
						chr = "";
						newState = __default;
					}
					break;
				case __numeric:
					if (__charMapNumeric.indexOf(chr) < 0)
						newState = __default;
					break;
				case __name:
					if (__charMapAlphaExtendedContinued.indexOf(chr) < 0)
						newState = __default;
			}

			// If state changed, set the new state push the token on the
			// stack of tokens and start a new token
			if (newState) {
				// If the current token is not empty,
				// push it in the instruction stack
				if (token.length)
					instructions.push([token, state]);
				// Get the new state returned by the state handler
				state = newState;
				// Flush the token
				token = "";
				// Unless the current character has been flushed (like for quotes
				// around strings, set back the index for the next iteration
				if (chr != "") i--;
			} else {
				// Push the parsing result of that char on the token
				token += chr;
			}
		}
		// Push the last token
		if (token.length)
			instructions.push([token, state]);
		return instructions;
	}

})();
	
	// Loading the previous module into an aliased module
	require.import('funex', module.exports);


	
	/*******************************************************************
	 * Loading: internals
	 * Source: 
	 */
	
	
/**
 * Populate the root frame with internal values
 * @param context
 * @return {*}
 */
module.exports = function (context) {
	var closure = context.root;
	closure.$removeWhitespaces = false;
	closure.$templates = {};
	closure["true"] = true;
	closure["false"] = false;
	closure["undefined"] = undefined;
	closure["null"] = null;
};

	
	// Loading the previous module into an aliased module
	require.import('internals', module.exports);


	
	/*******************************************************************
	 * Loading: helpers
	 * Source: 
	 */
	
	
/**
 * Populate the root frame with default helpers
 * @param context
 * @return {*}
 */
module.exports = function (context) {
	var closure = context.root;
	closure.$encodeURI = encodeURI;
	closure.$decodeURI = decodeURI;
	closure.$encodeURIComponent = encodeURIComponent;
	closure.$decodeURIComponent = decodeURIComponent;
	closure.$log = function ($body) {
		console.log.apply(console, arguments);
		return $body;
	};
	// $Array is used internally for compiling a funex with multiple arguments
	closure.$Array = function () {
		return Array.prototype.slice.call(arguments, 0);
	};
};
	
	// Loading the previous module into an aliased module
	require.import('helpers', module.exports);


	
	/*******************************************************************
	 * Loading: tags
	 * Source: 
	 */
	
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
				var closures = [
					closure,
					this
				];
				// Call render and pass-on the new closure as the "this" object.
				return template.render.apply(closures, arguments);
			};
		};
		this.render = function render() {
			var newclosure = this[0];
			var callerClosure = this[1];
			// Transfer the arguments passed to the template into named arguments into the new closure
			for (var i = 0; i < argNames.length; i++) {
				if (i < arguments.length) newclosure[argNames[i]] = arguments[i];
			}
			// Create a new stack and add the new closure to it
			var _stack = stack.slice(0);
			_stack.push(newclosure);
			_stack.push(callerClosure);
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
		closure["$templateBody"] = closure.$body();

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

	tags["include"] = function includeTag(stack, closure, path) {
		var root = stack[0];
		return root.$load(path);
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

	
	// Loading the previous module into an aliased module
	require.import('tags', module.exports);


	
	/*******************************************************************
	 * Loading: builder
	 * Source: 
	 */
	
	"use strict";

/**
 * Build an "Abstract Syntax Tree" from the code tokens
 * @param tokens
 * @return {Tag}
 */
var funex = global["funex"] || require("funex");

function build(_tokens, tags) {
	var tokens = _tokens.slice(0);
	var root;
	// todo: refactor: bring back the stack in normal order
	var stack; // node: the stack is in reverse order
	var tag;
	var name;
	var args;
	var token;
	var chainHead = null; // Initial tag which is wrapped be the tag chain
	var chainTail = null; // Latest tag which is wrapping he chained tag
	var isChained;
	var isInsideTag;
	var isSelfClosing;
	var tagContentString;
	var isCommented;

	// Create the root tag
	root = new Tag("print", "", tags).compile();
	stack = [root];

	while (tokens.length > 0) {
		token = tokens.shift();
		isChained = token[0];
		isInsideTag = token[1];
		isSelfClosing = token[2];
		tagContentString = token[3];
		isCommented = false;
		args = tagContentString;
		name = "print"; // default tag name
		if (isInsideTag) {

			if (tagContentString[0] === "/") {
				// If is a closing tag
				stack.shift();
				continue;
			}

			// Test if the tag is commented out with the "!" character
			if (tagContentString[0] === "!") {
				tagContentString = tagContentString.substring(1);
				isCommented = true;
			}

			// Test if there is a named tag, or auto tag
			if (tagContentString[0] === "=") {
				tagContentString = tagContentString.substring(1);
				name = "auto";
				args = tagContentString;
			} else {
				name = tagContentString.split(" ")[0].trim();
				args = tagContentString.substring(name.length);
			}

			tag = new Tag(name, args, tags);
			tag.isCommented = isCommented;

			// Add the new tag to either the main stack or the chained-tag stack
			// swap chainTail with chainHead
			if (chainTail) {
				chainTail.tags.unshift(tag);
				chainTail = tag;
			}
			if (isChained) {
				// If there is no chainTail create it
				if (!chainHead) chainHead = tag;
				// Move the chain head pointer to the current tag
				chainTail = tag;
			} else {
				if (chainTail) {
					stack[0].tags.unshift(chainHead);
					// Add the chain tail to the stack if it is not a self closing tag
					// (it will chain any upcomming child tags)
					if (!isSelfClosing) stack.unshift(chainTail);
					// Clear the chain
					chainTail = chainHead = null;
				} else {
					stack[0].tags.unshift(tag);
					if (!isSelfClosing) stack.unshift(tag);
				}
			}
		} else {
			// Create a "raw" tag for every token that is not part of an actual tag
			tag = new Tag(name, args, tags);
			tag.isRaw = true;
			stack[0].tags.unshift(tag);
		}
		tag.compile();
	}
	return root;
}

/**
 * A tag object!
 * @param name
 * @param argString
 * @constructor
 */
//todo: move the Tag class in a separate package
function Tag(name, argString, tags) {
	var autoTagName;
	this.tags = [];
	this.tags.render = renderTags;
	this.isRaw = false;
	this.isCommented = false;
	this.name = name;
	this.argString = argString;
	this.autoIsTag = false;
	this.handler = tags[this.name];
	// If no tag handler is found, fallback to the auto tag
	if (!this.handler) {
		this.handler = tags["auto"];
		if (this.name[0] !== "=") {
			this.autoIsTag = true;
			autoTagName = "'" + this.name + "'";
			this.argString = (this.argString) ? autoTagName + ", " + this.argString : autoTagName;
		}
	}

	this.args = function args() {
		return void 0
	};

	this.compile = function compile() {
		if (this.isRaw) {
			this.args = function raw() {
				return [this.argString];
			}
		} else {
			if (this.argString.trim() !== "") {
				this.args = funex("$Array(" + this.argString + ")");
			} else {
				this.args = function () {
					return []
				};
			}
		}

		return this;
	};

	this.render = function (_stack, parentClosure) {
		var tag = this;
		// Clone the parent context and add a new frame to it
		var stack = _stack.slice(0);
		var $root = stack[0];
		var output = "";
		var args = [];
		// Create a new frame with the default attributes
		var closure = {
			$parent:parentClosure,
			$root:$root,
			$model:$root.$model,
			$body:$body
		};

		// todo: cache output or memoize this function
		function $body() {
			var output = tag.tags.render(stack, closure);
			if (stack[0].$removeWhitespaces) output = output.trim();
			return output;
		}

		// Add a new frame to the context
		stack.push(closure);
		// Render the tag if it hasnt been commented out
		if (!this.isCommented) {
			args = this.args(stack);
			args.unshift(closure);
			args.unshift(stack);
			output = this.handler.apply(this, args);
			if (stack[0].$removeWhitespaces) output = output.trim();
			if (output === undefined) output = "";
		}
		return output;
	};

	function renderTags(context, frame) {
		var str = "";
		for (var i = this.length - 1; i >= 0; i--) {
			str = str + this[i].render(context, frame);
		}
		return str;
	}
}

module.exports = {
	Tag:Tag,
	build:build
};

	
	// Loading the previous module into an aliased module
	require.import('builder', module.exports);


	
	/*******************************************************************
	 * Loading: lexer
	 * Source: 
	 */
	
	"use strict";

function escapeDoubleCurlies(str) {
	return str.replace(/{{/g, "❰").replace(/}}/g, "❱")
}
function unescapeDoubleCurlies(str) {
	return str.replace(/❰/g, "{").replace(/❱/g, "}")
}

/**
 * Lexing function that break up a template string source into syntactic tokens
 * @param template
 * @param options
 * @return {Array}
 */
module.exports = function lexer(template, options) {
	var i;
	var j;
	var closing;
	var token;
	var tokens = [];
	var splits = [];
	var chainedTokens = [];
	var isSelfClosingTag;
	var isChained = false;
	template = escapeDoubleCurlies(template);
	// Find all occurences of start delimiters
	if (template) {
		for (i = template.indexOf(options.start); i >= 0; i = template.indexOf(options.start, i + 1)) {
			splits.push(i);
		}
		// Add a last marker for the end of the template
		splits.push(template.length);
		// Add the first token (from 0 to first start)
		tokens.push([
			isChained,
			false, // If token is inside a tag or outside
			false,
			unescapeDoubleCurlies(template.substring(0, splits[0]))
		]);
		for (i = 0; i < splits.length; i++) {
			closing = template.indexOf(options.end, splits[i]);
			if (closing >= 0) {
				token = template.substring(splits[i] + options.start.length, closing);

				// Extract Chained Tag syntax, if no chaining exist it will
				// only contain a single item
				chainedTokens = token.split(options.chain);
				for (j = 0; j < chainedTokens.length; j++) {
					isChained = chainedTokens.length > 1 && j !== chainedTokens.length - 1;
					token = chainedTokens[j].trim();

					isSelfClosingTag = (token[token.length - 1] === options.close) && token.length > 1;
					if (isSelfClosingTag) token = token.substring(0, token.length - 1); // Remove the closing slash
					tokens.push([
						isChained,
						true,
						isSelfClosingTag, // Test if is self-closing
						unescapeDoubleCurlies(token)
					]);
				}
				// Add the raw token after the end delimiter "}"
				isChained = false;
				token = template.substring(closing + options.end.length, splits[i + 1]);
				tokens.push([
					isChained,
					false,
					false,
					unescapeDoubleCurlies(token)
				]);

			}
		}
	}
	return tokens;
};



	
	// Loading the previous module into an aliased module
	require.import('lexer', module.exports);


	
	/*******************************************************************
	 * Loading: cook
	 * Source: 
	 */
	
	"use strict";
var pathModule = require("path");
var fs = require("fs");

var internals = global["funex"] || require("./middlewares/internals");
var helpers = global["helpers"] || require("./middlewares/helpers");
var tags = global["tags"] || require("./middlewares/tags");
var lexer = global["lexer"] || require("./lexer");
var builder = global["builder"] || require("./builder");

/**
 * The main class of the Cook api
 * @constructor
 */
function Cook(options) {
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

}

/**
 * The template class used to compile source and render models
 * @constructor
 */
function Template(cook) {
	var template = this;

	// The tags available at render-time
	this.tags = {};

	this.source = {
		code: "",
		tokens: [],
		rootTag: null
	};
	this.output = "";

	// Run all the render-time middlewares
	this.middlewares = new Middlewares(this);

	// A dummy template handler, to be replaced once compiled
	this.handler = function () {
		return "";
	};

	/**
	 * Compile source code and set the template handler
	 * @param source
	 */
	this.compile = function (source) {
		template.source.code = source;
		var lexerOptions = {
			start:"{",
			end:"}",
			close:"/",
			chain:">>"
		};
		// Transform the template source string into a series of syntax tokens
		var tokens = lexer(source, lexerOptions);
		template.source.tokens = tokens;
		// Build the syntax token into an Abstract Syntax Tree
		var rootTag = builder.build(tokens, this.tags);
		template.source.rootTag = rootTag;
		// Connect the template handler to the render of the root tag
		template.handler = function (context) {
			return rootTag.render(context.stack);
		};
		return template;
	};

	// Return a function that that will be used to render the template
	this.render = function render(model) {
		// Create a new evaluation context instance with the supplied model
		var context = new Context(model);
		// Add the helper used to get a new template from "outside"
		context.root.$get = function (name) {
			return cook.get(name);
		};
		// Add the helper used to load a resource/file from "outside"
		context.root.$load = function (name) {
			return cook.load(name);
		};
		this.middlewares.run(context);
		// Render the template and return its output
		template.output = this.handler(context);
		return template.output;
	};

}

/**
 * The object wrapper around the memory stack used when rendering templates and evaluating expressions
 * A new context is created whenever a template is rendered
 * @param model
 * @constructor
 */
function Context(model) {
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
}

/**
 * Class for adding middlewares to an object
 * @param host
 * @constructor
 */
function Middlewares(host) {
	var self = this;

	// Collection of middlewares
	this.items = [];

	/**
	 * Utility function for adding middlewares to an object
	 * @param middleware
	 */
	this.use = function use(middleware) {
		this.items.push(middleware);
		return this;
	};

	this.run = function apply(target) {
		// Apply the render-time middlewares
		for (var i = 0; i < this.items.length; i++) {
			this.items[i](target);
		}
		return this;
	};

	// Add the .use() shorthand for adding middlewares
	host.use = function (middlewares) {
		return self.use(middlewares);
	}

}

module.exports = Cook;

	
	// Loading the previous module into an aliased module
	require.import('cook', module.exports);



			global.Cook = require("cook");
		}
		var package = new Package(global);
	})(this);
