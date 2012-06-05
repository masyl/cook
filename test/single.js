var assert = require('assert');
var Cook = require('../lib');
var cook = new Cook();
var fs = require('fs');
var fixtureData = require("./sample-context.js");
var tests;

/**
 * Render a template in the "./templates" folder and compare to the expected output
 */
function Test(id) {
	this.id = id;
	this.input = "";
	this.output = "";
	this.title = "";
	this.result = undefined;
	this.template = null;
	this.run = function (callback) {
		this.template = cook.compile(this.input);
		this.result = this.template.render(fixtureData.main);
		try {
			assert.equal(this.result, this.output);
			callback(null, this);
		} catch (err) {
			callback(err, this);
		}
		return this;
	};
	this.load = function (callback) {
		var test = this;
		var file = './test/templates/' + test.id + '.json';
		fs.readFile(file, function (err, data) {
			if (err) callback(err);
			try {
				var testData = JSON.parse(data);
				test.title = testData.title;
				test.input = testData.input.join("\n");
				test.output = testData.output.join("\n");
			} catch (e) {
				callback(e);
			}
			callback(null, test);
		});
		return this;
	}

}

function load(Ids, callback) {
	var i;
	var test;
	var tests = [];
	var loadedTests = [];
	for (i = 0; i < Ids.length; i++) {
		test = new Test(Ids[i]).load(onLoaded);
		tests.push(test);
	}
	function onLoaded(err, test) {
		if (err) throw err;
		loadedTests.push(test);
		if (loadedTests.length == tests.length) {
			callback(null, loadedTests);
		}
	}

	return tests;
}

function run(tests) {
	var i;
	console.time("tests");
	var errors = "";
	var failed = [];
	console.log = function () {
	};
	for (i = 0; i < tests.length; i++) {
		tests[i].run(function (err, test) {
			if (err) {
				process.stdout.write("✗");
				failed.push(test.id);
				errors = errors + (formatErr(err, test));
			} else {
				process.stdout.write("✓");
			}
		});
	}
	process.stdout.write("\n");
	console.timeEnd("tests");
	if (errors) {
		process.stdout.write(failed.length + " FAILED TESTS: " + failed.join(", ") + "\n");
		process.stdout.write(errors);
	} else {
		process.stdout.write("SUCCESS!\n");
	}
}

function formatErr(err, test) {
	return "\n===============================================\n" +
		"ERROR:\n" +
		err + "\n" +
		"FAILED: " +
		test.title + "  {" + test.id + "}\n" +
		"RESULT:\n" +
		darkspaces(test.result) + "\n" +
		"EXPECTED:\n" +
		darkspaces(test.output) + "\n" +
		"===============================================\n";
	function darkspaces(str) {
		if (str) return str.replace(/\t/g, "\\t", 0).replace(/\n/g, "\\n\n", 0);
		return "";
	}
}

tests = [
	"template-recursive"
];
tests = require("./tests.js");

load(tests, function (err, tests) {
	run(tests);
});

