var
	assert = require('assert'),
	cook = require('../lib/cook'),
	fs = require('fs');

var fixtureData = {
	not: function(exp) {
		return !exp;
	},
	isTrue: true
};

function cookTestFile(name) {
	var inFile = './fixtures/templates/' + name + '-in.html';
	var outFile = './fixtures/templates/' + name + '-out.html';
	fs.readFile(inFile, function (err, inData) {
		fs.readFile(outFile, function (err, outData) {
			var template = cook(inData.toString());
			var result = template(fixtureData);
			assert.equal(result, outData.toString());
		});
	});
}

//cookTestFile("if");
cookTestFile("ifElse");