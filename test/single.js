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
	},
	friends: [
		{
			name: "Tom Thomson",
			email: "tom@gmail.com"
		},
		{
			name: "Jack Jackson",
			email: "jackjackson@gmail.com"
		},
		{
			name: "Will Williamson",
			email: "bigwill69@gmail.com"
		}
	],
	html: "<div>This is <blink>html</blink>!</div>"
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

console.time("tests");
/*
cookTestFile("if");
cookTestFile("if-else");
cookTestFile("if-multiple-else");
cookTestFile("if-else-if");
cookTestFile("if-filtered");
cookTestFile("print");
cookTestFile("print-filtered");
cookTestFile("each-array");
cookTestFile("each-object");
cookTestFile("partials-basic");
cookTestFile("comment-poundSign");
cookTestFile("comment-poundSignBlock");
cookTestFile("comment-poundSignOnOpenTag");
cookTestFile("filter-decodeURI");
cookTestFile("filter-encodeURI");
cookTestFile("filter-decodeURIComponent");
cookTestFile("filter-encodeURIComponent");
*/
cookTestFile("var");
console.timeEnd("tests");

/*
Todo:
Loop object and alt tags
Whitespace control
Set of standard filters
Functional utilities (helpers)
Multi-scope resolution
Error on unknown tag
"root", "parent", "this" or "global" values for targeting scope levels
Each tag with an alias for the item
Test descriptions in the fixture templates
"Var" tag
"With" tag
Support handlers for catching the render tree
Event listeners on lexing, building and rendering
Provide a base context for a whole instance of cook
Clean all to-do's
Async
*/