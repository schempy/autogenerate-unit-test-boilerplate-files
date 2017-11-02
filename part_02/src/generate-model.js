const traverse = require("babel-traverse").default;
const t = require("babel-types");
const Model = require("./model");

function generate(ast) {
  const model = new Model();
  let functions = [];
  let moduleExports = null;

  // Traverse the AST
  traverse(ast, {
    FunctionDeclaration(path) {
      functions.push(path);
    },

    MemberExpression(path) {
      // Check if the object is the type Identifier with
      // the name 'module'.
      if (t.isIdentifier(path.node.object, { name: "module" })) {
        moduleExports = path.parent;
      }
    }
  });

  // Add module.exports to the Model.
  model.addModuleExports(getModuleExportsDetails(moduleExports));

  // Loop over functions and add to the Model only if the
  // function is exported.
  functions.forEach(func => {
    const functionDetails = getFunctionDetails(func);

    const isExported = model.getModuleExports().some(moduleExport => {
      return moduleExport === functionDetails.name;
    });

    // Only add the function if it's exported.
    if (isExported) {
      model.addFunction(functionDetails);
    }
  });

  return model;
}

function getModuleExportsDetails(node) {
  let moduleExports = [];

  if (t.isIdentifier(node.right)) {
    moduleExports.push(node.right.name);
  } else if (t.isObjectExpression(node.right)) {
    node.right.properties.forEach(property => {
      moduleExports.push(property.key.name);
    });
  }

  return moduleExports;
}

function getFunctionDetails(path) {
  let returns = false;
  let mocks = [];

  // Function name.
  const name = path.node.id.name;

  // Function parameters
  const params = path.node.params.reduce((acc, param) => {
    acc.push(param.name);

    return acc;
  }, []);

  // Traverse the FunctionDeclaration AST for
  // calls to other functions and if the function
  // returns a value.
  path.traverse({
    CallExpression: function(callExpPath) {
      mocks.push({
        name: callExpPath.node.callee.name
      });
    },

    ReturnStatement: function() {
      returns = true;
    }
  });

  return {
    name: name,
    params: params,
    mocks: mocks,
    returns: returns
  };
}

module.exports = generate;
