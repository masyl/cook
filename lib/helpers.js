module.exports = {
	$encodeURI:encodeURI,
	$decodeURI:decodeURI,
	$encodeURIComponent:encodeURIComponent,
	$decodeURIComponent:decodeURIComponent,
	$log:function ($body) {
		console.log.apply(console, arguments);
		return $body;
	},
	// $Array is used internally for compiling a funex with multiple arguments
	// todo: Remove the need for "$Array" by adding the feature in Funex
	$Array:function () {
		return Array.prototype.slice.call(arguments, 0);
	}
};