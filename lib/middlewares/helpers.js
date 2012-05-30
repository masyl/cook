
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
	// todo: Remove the need for "$Array" by adding the feature in Funex
	closure.$Array = function () {
		return Array.prototype.slice.call(arguments, 0);
	};
};