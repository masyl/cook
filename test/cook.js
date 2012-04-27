var mux = require("../lib/mux.js")({});
var data = {
	item: {
		something: "SOMETHING!!!!"
	}
};
var template = "<div>This is not {{out}}<span>[{{out item.something /}}]</span><span>{{out 'some closing tag' /}}</span>{{/out}} not the end.</div>";
var result = mux(template)(data);
console.log(result);