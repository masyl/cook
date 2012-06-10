
var funex = global["funex"] || require("funex");
var yeldElements = require('./yeldElements');

/**
 * A tag object!
 * @param name
 * @param argString
 * @constructor
 */
module.exports = function (cook) {
	var options = cook.options;
	return function Tag(name, argString, tags) {
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
	
		this.render = function (_stack, parentClosure, _mode) {
			var tag = this;
			// Clone the parent context and add a new frame to it
			var stack = _stack.slice(0);
			var $root = stack[0];
			var output = "";
			var args = [];
			// Create a new frame with the default attributes
			// todo: The closure object should be a class
			var closure = {
				$parent:parentClosure,
				$root:$root,
				$model:$root.$model,
				$body:$body
			};
			var document = closure.$root.$document;

			if (_mode !== undefined) closure.$root.$mode = _mode;
			var mode = closure.$root.$mode;

			// todo: cache output or memoize this function
			function $body() {
				var elements = [];
				var output = tag.tags.render(stack, closure);
				//todo: figure out how whitespace should be trimmed when rendering in object mode
				if (mode === "text") {
					if (stack[0].$removeWhitespaces) output = output.trim();
				} else if (mode === "dom") {
					yeldElements(output, document, function (element) {
						elements.push(element);
					});
					output = elements;
				}
				return output;
			}
	
			// Add a new frame to the context
			stack.push(closure);
			// Render the tag if it hasnt been commented out
			if (!this.isCommented) {
				try {
					args = this.args(stack);
				} catch (err) {
					if (mode === "object") {
						output = err;
					} else if (mode === "dom") {
						output = document.createElement("error");
						output.innerHTML = err;
					} else {
						output = options.failedTagMessage(err, this, closure);
					}
					return output;
				}
				args.unshift(closure);
				args.unshift(stack);

				output = this.handler.apply(this, args);
				if (mode === "object") {
					//todo: figure out how whitespace should be trimmed when rendering in object mode
					//if (stack[0].$removeWhitespaces) output = output.trim();
					// todo: figure out how to outputs comments in object mode
				} else if (mode === "dom") {
					// todo DOM
					// todo: figure out how to outputs comments in DOM mode

				} else {
					if (output === undefined) output = "";
					output = output.toString();
					if (stack[0].$removeWhitespaces) output = output.trim();
				}
			}
			return output;
		};
	
		function renderTags(stack, closure) {
			var mode = closure.$root.$mode;
			var output;
			var outputs = [];
			for (var i = this.length - 1; i >= 0; i--) {
				output = this[i].render(stack, closure);
				if (mode === "object" || mode === "dom") {
					if (typeof output === "string" && output.trim() === "")
						output = undefined;
				}
				if (output !== undefined) outputs.push(output);
			}
			if (mode === "text") {
				outputs = outputs.join("");
			}
			return outputs;
		}
	};
};