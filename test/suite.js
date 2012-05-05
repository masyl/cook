var
	cycles = 1,
	fixtures = require("./fixtures"),
	runner = require("./runner");

// test name, expression, expected
var tests = [
	[
		"Template with simple values",
		"<div>This is not {{out}}<span>[{{out item.something /}}]</span><span>{{out 'some closing tag' /}}</span>{{/out}} not the end.</div>",
		"<div>This is not <span>[SOMETHING!!!!]</span><span>some closing tag</span>not the end.</div>"
	]
];

runner(tests, fixtures, cycles);