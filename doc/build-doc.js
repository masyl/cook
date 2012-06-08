var fs = require("fs");
var Cook = require("../lib");
var cook = new Cook();
cook.options.rootPath = __dirname;

function renderToFile(template, path) {
	var output = cook.get(template).render({});
	fs.writeFileSync(path, output, "utf-8");
	console.log("Generated '" + template + "'  to : " + path);
}

renderToFile("doc-html", __dirname + "/documentation.html");
renderToFile("doc-html", __dirname + "/../../index.html");
renderToFile("doc-markdown", __dirname + "/documentation.md");
renderToFile("doc-markdown", __dirname + "/../../README.md");
