var
	assert = require('assert'),
	cook = require('../lib/cook'),
	fs = require('fs');

var fixtureData = {
	isFalse: false,
	isTrue: true,
	username: "johndoe@acme.com",
	firstname: "John",
	lastname: "Doe",
	not: function(exp) {return !exp;},
	uppercase: function(a) {return a.toUpperCase()},
	lowercase: function(a) {return a.toLowerCase()},
	joinFullname: function(a, b) {return a + " " + b},
	keywords: ["hoopla", "thingamabob", "whoopy", "dingus", "wooompff", "tagada!"],
	dog: {
		weight: 10,
		legs: 4,
		color: "blue",
		name: "spot"
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
cookTestFile("if-filtered");
cookTestFile("print");
cookTestFile("print-filtered");
cookTestFile("each-array");
cookTestFile("each-object");

/*
Todo:
loop object and alt tags
render/template
whitespace control
set of standard filters
functional utilities
multi-scope resolution

*/