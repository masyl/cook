var assert = require('assert');
var cook = require('../lib');
var fs = require('fs');

var fixtureData = require("../fixtures/sample-context.js");

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
		console.log("Test: ", test.title + "  {" + name + "}");
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

function darkspaces(str) {
	return str.replace(/\t/g, "\\t",0).replace(/\n/g, "\\n\n",0)
}


console.time("tests");
cookTestFile("if-filtered");

/*
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
cookTestFile("elemTag");
cookTestFile("elemTag-withPartials");
cookTestFile("auto-elemTag");
cookTestFile("auto-applyFunction");
cookTestFile("auto-eachArray");
cookTestFile("auto-eachArrayNamedValue");
cookTestFile("auto-withObject");
cookTestFile("auto-printString");
cookTestFile("auto-printNumber");
cookTestFile("auto-printDate");
cookTestFile("auto-printObjectToString");
cookTestFile("auto-ifBoolean");
cookTestFile("auto-partials");
cookTestFile("attr-onElem");
cookTestFile("attr-onPartials");
cookTestFile("each-valueIsObject");
*/
console.timeEnd("tests");
