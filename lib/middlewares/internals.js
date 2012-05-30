
/**
 * Populate the root frame with internal values
 * @param frame
 * @return {*}
 */
module.exports = function (template) {
	var root = template.root;
	root.$removeWhitespaces = false;
	root.$templates = {};
	root["true"] = true;
	root["false"] = false;
	root["undefined"] = undefined;
	root["null"] = null;
}
