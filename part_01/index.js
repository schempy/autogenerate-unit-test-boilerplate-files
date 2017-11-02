const fs = require("fs");
const path = require("path");
const babylon = require("babylon");
const generateModel = require("./src/generate-model");

const opts = {
  sourceType: "module"
};

const input = fs.readFileSync(path.join(process.cwd(), "my-module.js"), "utf8");
const ast = babylon.parse(input, {});
const model = generateModel(ast);

console.log(model);
