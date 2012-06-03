var fs = require("fs");
var Cook = require("../lib");
var uglifyParser = require("uglify-js").parser;
var uglify = require("uglify-js").uglify;
var path;
var cook;

var cook = new Cook();
cook.options.rootPath = __dirname;

var output = cook.get("cook").render({});

path = __dirname + "/libs/cook/cook.js";
fs.writeFileSync(path, output, "utf-8");

console.log("Saved packaged version : " + path);

var ast = uglifyParser.parse(output); // parse code and get the initial AST
ast = uglify.ast_squeeze(ast); // get an AST with compression optimizations
ast = uglify.ast_squeeze_more(ast); // get an AST with compression optimizations
ast = uglify.ast_mangle(ast, {
	mangle: true
}); // get a new AST with mangled names
var compressedOutput = uglify.gen_code(ast);

path = __dirname + "/libs/cook/cook-min.js";
fs.writeFileSync(path, compressedOutput, "utf-8");
console.log("Saved minified version : " + path);

console.log("Build succesfull!")