function ClientRequire() {
	var self = this;
	this.modules = [];
	function __require(key) {
		return self.modules[key];
	}
	__require.load = function (key, module) {
		self.modules[key] = module;
	};
	return __require;
}
