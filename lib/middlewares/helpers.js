
/**
 * Populate the root frame with default helpers
 * @param template
 * @return {*}
 */
module.exports = function (template) {
	var root = template.root;
	root.$encodeURI = encodeURI;
	root.$decodeURI = decodeURI;
	root.$encodeURIComponent = encodeURIComponent;
	root.$decodeURIComponent = decodeURIComponent;
	root.$log = function ($body) {
		console.log.apply(console, arguments);
		return $body;
	};
	// $Array is used internally for compiling a funex with multiple arguments
	// todo: Remove the need for "$Array" by adding the feature in Funex
	root.$Array = function () {
		return Array.prototype.slice.call(arguments, 0);
	};
};