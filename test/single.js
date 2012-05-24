var
	assert = require('assert'),
	cook = require('../lib'),
	fs = require('fs');

function darkspaces(str) {
	return str.replace(/\t/g, "\\t",0).replace(/\n/g, "\\n\n",0)
}

// todo: load fixtures from an external standalone file
var fixtureData = {
	year2000: new Date("2000-01-01"),
	isFalse: false,
	isTrue: true,
	username: "johndoe@acme.com",
	firstname: "John",
	lastname: "Doe",
	not: function not(exp) {return !exp;},
	uppercase: function uppercase(a) {
		return a.toUpperCase();
	},
	lowercase: function lowercase(a) {
		return a.toLowerCase();
	},
	joinFullname: function joinFullname(a, b) {
		return a + " " + b;
	},
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
	},
	dalmatians: 101,
	lorem: "Ipsum",
	isUndefined:  void 0,
	thingamabob1: new Thingamabob(1)
};

function Thingamabob (id) {
	this.toString = function () {
		return "Thingamabob:" + id;
	}
}
/**
 * Render a template in the "/fixtures/templates" and compare to the expected output
 * @param name
 */
function cookTestFile(name) {
	var file = './fixtures/templates/' + name + '.json';
	fs.readFile(file, function (err, data) {
		try {
			var test = JSON.parse(data);
		} catch (e) {
			console.error("Failed on : ", name);
			throw e;	
		}
		var input = test.input.join("\n");
		var output = test.output.join("\n");
		var result = cook(input)(fixtureData);
		console.log("Test: ", test.title || "{" + name + "}");
		try {
			assert.equal(result, output);
		} catch (err) {
			console.log("RESULT:===============================================");
			console.log(darkspaces(result));
			console.log("EXPECTED:=============================================");
			console.log(darkspaces(output));
			console.log("ERROR:================================================");
			console.log(err);
		}
	});
}

console.time("tests");

cookTestFile("if");
cookTestFile("if-else");
cookTestFile("if-multiple-else");
cookTestFile("if-else-if");
cookTestFile("if-filtered");
cookTestFile("apply-decodeURIComponent");
cookTestFile("apply-decodeURIComponent-compact");
cookTestFile("apply-encodeURIComponent");
cookTestFile("apply-encodeURIComponent-compact");
cookTestFile("apply-usingSingleFunction");
cookTestFile("apply-usingSingleFunction-compact");
cookTestFile("apply-encodeURI");
cookTestFile("apply-encodeURI-compact");
cookTestFile("apply-decodeURI");
cookTestFile("apply-decodeURI-compact");
cookTestFile("binding-each");
cookTestFile("binding-each-compact");
cookTestFile("chaining-forward");
cookTestFile("comment-poundSign");
cookTestFile("comment-poundSignBlock");
cookTestFile("comment-poundSignOnOpenTag");
cookTestFile("print");
cookTestFile("print-compact");
cookTestFile("print-withoutTag");
cookTestFile("print-filtered");
cookTestFile("partials-useAsFunction");
cookTestFile("partials-useAsTag");
cookTestFile("partials-chainedWithEach");
cookTestFile("partials-renderTag");
cookTestFile("partials-compact");
cookTestFile("each-array");
cookTestFile("each-array-compact");
cookTestFile("each-array-namedValue");
cookTestFile("each-object");
cookTestFile("each-object-compact");
cookTestFile("each-object-namedValue");
cookTestFile("tagless-apply");
cookTestFile("tagless-apply-compact");
cookTestFile("var");
cookTestFile("with");
cookTestFile("log");
cookTestFile("log-compact");
cookTestFile("whitespace-remove");
cookTestFile("whitespace-remove-compact");
cookTestFile("elementTag");
cookTestFile("elementTag-withPartials");
cookTestFile("auto-elementTag");
cookTestFile("auto-applyFunction");
cookTestFile("auto-eachArray");
cookTestFile("auto-eachArrayNamedValue");
cookTestFile("auto-withObject");
cookTestFile("auto-printString");
cookTestFile("auto-printNumber");
cookTestFile("auto-printDate");
cookTestFile("auto-printObjectToString");

cookTestFile("auto-ifBoolean");

console.timeEnd("tests");
