
var funex = global["funex"] || require("funex");

/**
 * A tag object!
 * @param name
 * @param argString
 * @constructor
 */
	//todo: move the Tag class in a separate package
module.exports = function Tag(name, argString, tags) {
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

