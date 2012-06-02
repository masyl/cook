var Cook = require("../lib");

var cook = new Cook();
cook.options.rootPath = __dirname;

var output = cook.get("cook").render({});
console.log(output);
