
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
	closure.$escapeHTML = function $escapeHTML($body) {
		return $body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	};

};