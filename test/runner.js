var
		result,
		cook = require("../lib/cook"),
		mocha = require("mocha"),
		should = require("should"),
		assert = require("assert");

module.exports = function (tests, fixtures, cycles) {
	describe("With a series of tests and fixtures, repeated " + cycles + " times", function () {
		var
				i,
				options,
				singleTest;
		for (i = 0; i < tests.length; i++) {
			singleTest = tests[i];
			options = {};
			if (singleTest.length === 4) options = singleTest[3];
			test(singleTest[0], singleTest[1], singleTest[2], options, cycles);
		}
	});

	function test(testName, templateString, expected, options, cycles) {
		var template = cook(templateString);

		describe(testName, function () {
			var result;

			it('Should render the expected output', function() {
				var i, e, err = "";
				if (options.isException) {
					try {
						for (i = 0; i < cycles; i++) {
							result = template(fixtures);
						}
					} catch (e) {
						err = e;
					}
					err.should.equal(expected);
				} else {
					for (i = 0; i < cycles; i++) {
						result = template(fixtures);
					}
					result.should.equal(expected);
				}
			});


		});
	}
}