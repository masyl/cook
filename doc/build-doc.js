var fs = require("fs");
var Cook = require("../lib");
var path;

var cook = new Cook();
cook.options.rootPath = __dirname;
var output = cook.get("documentation").render({});

path = __dirname + "/documentation.html";
fs.writeFileSync(path, output, "utf-8");

console.log("Generated html documentation : " + path);
