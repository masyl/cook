var fs = require("fs");
var Cook = require("../lib");

var cook = new Cook();
cook.options.rootPath = __dirname;

var output = cook.get("cook").render({});
var path = __dirname + "/libs/cook/cook.js";
fs.writeFileSync(path, output, "utf-8");

console.log("Build succesfull: " + __dirname + "/libs/cook/cook.js")