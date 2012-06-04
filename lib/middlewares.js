/**
 * Class for adding middlewares to an object
 * @param host
 * @constructor
 */
module.exports = function Middlewares(host) {
	var self = this;

	// Collection of middlewares
	this.items = [];

	/**
	 * Utility function for adding middlewares to an object
	 * @param middleware
	 */
	this.use = function use(middleware) {
		this.items.push(middleware);
		return this;
	};

	this.run = function apply(target) {
		// Apply the render-time middlewares
		for (var i = 0; i < this.items.length; i++) {
			this.items[i](target);
		}
		return this;
	};

	// Add the .use() shorthand for adding middlewares
	host.use = function (middlewares) {
		return self.use(middlewares);
	}

}

