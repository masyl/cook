function Require(context, global) {
	var self = this;
	this.modules = [];
	function require(key) {
		return self.modules[key];
	}
	require.import = function (key, module) {
		self.modules[key] = module;
		global[key] = module;
	};
	return require;
}

