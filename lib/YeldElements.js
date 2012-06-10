module.exports = function yeldElements(array, document, callback) {
	var item;
	var element;
	var i;
	var html = "";
	var containerElement = document.createElement("div");
	if (array && array.length) {
		for (i = 0; i < array.length; i++) {
			item = array[i];
			if (typeof item === "string") {
				html = html + document.createTextNode(item);
			} else if (typeof item === "object" && item.ownerDocument === document) {
				// Do nothing... the child is already properly formatted
				console.log(item);
				if (item.nodeValue) {
					html = html + item.nodeValue;
				} else {
					html = html + item.outerHTML;
				}
			} else if (typeof item === "object" && item.constructor.name === "Array") {
				/*
				yeldElements(item, document, function (element) {
					callback(element);
				});
				*/
			} else {
				console.log("---------------------");
				console.log(item);
				element = document.createElement("error");
				element.innerHTML = "Unsuported type for dom rendering!";
			}
		}
		containerElement.innerHTML = html;
		console.log(containerElement.innerHTML);
		console.log("DONE!!!");
		for (i = 0; i < containerElement.childNodes.length; i++) {
			callback(containerElement.childNodes[i]);
		}
	}
};
