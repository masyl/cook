var fs = require("fs");
var Cook = require("../lib");
var cook = new Cook();
cook.options.rootPath = __dirname;

/*

jsdom = require("jsdom");
jsdom.env("<html></html>", function(err, window) {
	// free memory associated with the window
	if (!err && window) {
		cook.options.HTMLDocument = window.HTMLDocument;
		renderDOMToFile("doc-html", __dirname + "/documentation.html");
	}
});

function renderDOMToFile(template, path) {
	var output = cook.get(template).renderDOM({});
	console.log(output);
	fs.writeFileSync(path, json, "utf-8");
	console.log("Generated '" + template + "'  to : " + path);
}

*/

function renderTextToFile(template, path) {
	var output = cook.get(template).render({});
	fs.writeFileSync(path, output, "utf-8");
	console.log("Generated '" + template + "'  to : " + path);
}

function renderJSONToFile(template, path) {
	var output = cook.get(template).renderObject({});
	var json = JSON.stringify(output);
	fs.writeFileSync(path, json, "utf-8");
	console.log("Generated '" + template + "'  to : " + path);
}

renderTextToFile("doc-html", __dirname + "/documentation.html");
renderTextToFile("doc-html", __dirname + "/../../index.html");

renderTextToFile("doc-markdown", __dirname + "/documentation.md");
renderTextToFile("doc-markdown", __dirname + "/../../README.md");

renderJSONToFile("doc-html", __dirname + "/documentation.json");
renderJSONToFile("documentation", __dirname + "/documentation.json");
