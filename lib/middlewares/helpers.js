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
	closure.$log = function $log($body) {
		console.log.apply(console, arguments);
		return $body;
	};
	// $Array is used internally for compiling a funex with multiple arguments
	closure.$Array = function () {
		return Array.prototype.slice.call(arguments, 0);
	};
	closure.$or = function $or() {
		for (var i = 0; i < arguments.length; i++) {
			if (!!arguments[i]) return arguments[i];
		}
	};
	closure.$char = function $char(num) {
		return String.fromCharCode(num);
	};
	closure.$join = function $join() {
		return [].splice.call(arguments, 0).join("");
	};
	closure.$equals = function $equals(a, b) {
		return a == b;
	};
	closure.$escapeHTML = function $escapeHTML($body) {
		return $body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	};
	closure.$indent = function $indent(str, count, _chr) {
		var i;
		var chr = _chr || " ";
		var indent = "";
		for (i = 0; i < count; i++) {
			indent = indent + chr;
		}
		var lines = str.split("\n");
		for (i = 0; i < lines.length; i++) {
			lines[i] = indent + lines[i];
		}
		return lines.join("\n");
	};

	closure.$unindent = function $indent(str) {
		var i, j;		
		var firstChar;
		var firstCharIsWhitespace = true;
		var lines = str.split("\n");
		function uniformIndent(lines) {
			var isUniform = true;
			var indentedLines = 0;
			var indentChar = "";
			var chr;
			for (i = 0; i < lines.length; i++) {
				if (lines[i] !== "") {
					indentedLines++;
					chr = lines[i][0];
					if (chr === " " || chr === "\t") {
						if (indentChar === "") indentChar = chr;
						if (indentChar !== chr) {
							isUniform = false;
							break;
						}
					} else {
						isUniform = false;
						break;
					}
				}
			}
			if (isUniform && indentedLines) return indentChar;
			return null;
		}
		if (lines.length) {
			var indent;
			indent = uniformIndent(lines);
			while (indent) {
				for (i = 0; i < lines.length; i++) {
					lines[i] = lines[i].substring(1);
				}
				indent = uniformIndent(lines);
			}
		}
		return lines.join("\n");
	};

};