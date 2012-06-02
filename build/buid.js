var Cook = require("../lib");
var fs = require("fs");

var cook = new Cook();

//todo: option to set root of resolver
cook.resolve = function (id) {
	var str = "";
	var buffer = fs.readFileSync(__dirname + "/" + id + ".cook");
	if (buffer) str = buffer.toString();
	return str;
};
var output = cook.get("cook").render({});
console.log(output);
