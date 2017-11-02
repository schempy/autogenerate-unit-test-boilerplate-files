const t = require("babel-types");
const babelGenerate = require("babel-generator").default;

function generate(model) {
  const testBlocks = createTestBlock(model);
  const describeBlock = createDescribeBlock(testBlocks);

  const body = [describeBlock];

  const programNode = t.program([describeBlock], []);
  const output = babelGenerate(programNode, {
    quotes: "double"
  });

  return output.code;
}

function createDescribeBlock(blockStatement) {
  const ast = t.expressionStatement(
    t.callExpression(t.identifier("describe"), [
      t.stringLiteral("Test Description"),
      t.arrowFunctionExpression([], t.blockStatement(blockStatement))
    ])
  );

  return ast;
}

function createTestBlock(model) {
  const functions = model.getFunctions();
  const testBlock = functions.reduce((acc, functionDetail) => {
    let functionCallAst = null;
    let blockStatement = [];

    // Get all parmeters for the function.
    const params = functionDetail.params.reduce((acc, param) => {
      acc.push(t.identifier(param));

      return acc;
    }, []);

    // Create a variable for each parameter that is needed to call the function.
    // This allows the developer to set a value for each parameter.
    //
    // Example:
    //
    // Let's have a function with the following signature: someFunction(param1, param1)
    //
    // The test will have the following:
    // const param1 =  null;
    // const param2 = null;
    // someFunction(param1, param2);
    const variables = functionDetail.params.reduce((acc, param) => {
      const variable = t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier(param), t.nullLiteral())
      ]);

      acc.push(variable);

      return acc;
    }, []);

    // The function returns a value.
    if (functionDetail.returns) {
      functionCallAst = t.variableDeclaration("const", [
        t.variableDeclarator(
          t.identifier("result"),
          t.callExpression(t.identifier(functionDetail.name), params)
        )
      ]);

      // The function does not return a value.
    } else {
      functionCallAst = t.expressionStatement(
        t.callExpression(t.identifier(functionDetail.name), params)
      );
    }

    blockStatement.push(...variables);
    blockStatement.push(functionCallAst);

    // Create test block.
    const ast = t.expressionStatement(
      t.callExpression(t.identifier("test"), [
        t.stringLiteral(functionDetail.name),
        t.arrowFunctionExpression([], t.blockStatement(blockStatement))
      ])
    );

    acc.push(ast);

    return acc;
  }, []);

  return testBlock;
}

module.exports = generate;
