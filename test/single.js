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
	html: "<div>This is <blink>html</blink>!</div>",
	colors: {
		label: "Colors: ",
		red: "#FF0000",
		white: "#000000",
		blue: "#0000FF"
	},
	loopElements: {
		a: "a1",
		b: "b2",
		c: "c3",
		d: "d4",
		e: "e5",
		f: "f6",
		g: "g7",
		h: "h8"
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
		var result = cook(input)(fixtureData);
		assert.equal(result, output);
	});
}

console.time("tests");

cookTestFile("if");
cookTestFile("if-else");
cookTestFile("if-multiple-else");
cookTestFile("if-else-if");
cookTestFile("if-filtered");
cookTestFile("print");
cookTestFile("print-filtered");
cookTestFile("partials-basic");
cookTestFile("comment-poundSign");
cookTestFile("comment-poundSignBlock");
cookTestFile("comment-poundSignOnOpenTag");
cookTestFile("filter-decodeURI");
cookTestFile("filter-encodeURI");
cookTestFile("filter-decodeURIComponent");
cookTestFile("filter-encodeURIComponent");
cookTestFile("filter-usingSingleFunction");
cookTestFile("var");
cookTestFile("with");
cookTestFile("log");
cookTestFile("each-array");
cookTestFile("each-object");
cookTestFile("each-loop");
cookTestFile("whitespace-remove");

console.timeEnd("tests");

/*
## Roadmap
- Change syntax to single brakets
- Allow escaping of brakets
- Create html tags as fallbacks
- "each" tag with a defined alias for the item
- Multi-level scope resolution
- Test for multi-level "each" loops
- Api to register filters, and functions in the global scope
- Error on unknown tag
- "root", "parent", "this" or "global" values for targeting scope levels
- Test descriptions in the fixture templates
- Support handlers for catching the render tree
- Event listeners on lexing, building and rendering
- Provide a base context for a whole instance of cook through an attribute like "global"
- Code comments and method signatures
- Clean all to-do's

## Advanced features:

- Async
- reusing partials as functions
- "eval" and eval() for evaluating dynamic funex
 - Allo running in "bouble braket" mode for outputting json

 */