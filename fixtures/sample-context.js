// todo: load fixtures from an external standalone file
module.exports.main = {
	year2000: new Date("2000-01-01"),
	isFalse: false,
	isTrue: true,
	username: "johndoe@acme.com",
	firstname: "John",
	lastname: "Doe",
	not: function not(exp) {return !exp;},
	uppercase: function uppercase(a) {
		return (a+"").toUpperCase();
	},
	lowercase: function lowercase(a) {
		return (a+"").toLowerCase();
	},
	joinFullname: function joinFullname(a, b) {
		return a + " " + b;
	},
	keywords: ["hoopla", "thingamabob", "whoopy", "dingus", "wooompff", "tagada!"],
	dog: {
		weight: 10,
		legs: 4,
		color: "blue",
		name: "spot"
	},
	cats: [
		{
			name: "Mr.Kibs",
			color: "brown"
		},
		{
			name: "Foofoo",
			color: "white"
		},
		{
			name: "Stew",
			color: "caramel"
		}
	],
	friends: [
		{
			name: "Tom Thomson",
			email: "tom@gmail.com"
		},
		{
			name: "Jack Jackson",
			email: "jackjackson@gmail.com"
		},
		{
			name: "Will Williamson",
			email: "bigwill69@gmail.com"
		}
	],
	html: "<div>This is <blink>html</blink>!</div>",
	colors: {
		label: "Colors: ",
		red: "#FF0000",
		white: "#000000",
		blue: "#0000FF"
	},
	loopElements: {
		a: "a1",
		b: "b2",
		c: "c3",
		d: "d4",
		e: "e5",
		f: "f6",
		g: "g7",
		h: "h8"
	},
	dalmatians: 101,
	lorem: "Ipsum",
	isUndefined:  void 0,
	thingamabob1: new Thingamabob(1)
};



function Thingamabob (id) {
	this.toString = function () {
		return "Thingamabob:" + id;
	}
}
