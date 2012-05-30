
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
}
