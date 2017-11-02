function Model() {
  this.functions = [];
  this.moduleExports = [];
}

Model.prototype.addFunction = function(func) {
  this.functions = [...this.functions, func];
};

Model.prototype.addModuleExports = function(moduleExports) {
  this.moduleExports = moduleExports;
};

Model.prototype.getFunctions = function() {
  return this.functions;
};

Model.prototype.getModuleExports = function() {
  return this.moduleExports;
};

module.exports = Model;
