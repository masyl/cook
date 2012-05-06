var
	assert = require('assert'),
	cook = require('../lib/cook'),
	fs = require('fs');

var fixtureData = {
	isFalse: false,
	isTrue: true,
	not: function(exp) {
		return !exp;
	}
};

/**
 * Render a template in the "/fixtures/templates" and compare to the expected output
 * @param name
 */
function cookTestFile(name) {
	var split,
		input,
		output,
		file = './fixtures/templates/' + name + '.html';
	fs.readFile(file, function (err, data) {
		split = data.toString().split("\n========================================\n");
		input = split[0];
		output = split[1];
		assert.equal(cook(input)(fixtureData), output);
	});
}

cookTestFile("if");
cookTestFile("if-else");
cookTestFile("if-multiple-else");
cookTestFile("if-else-if");
