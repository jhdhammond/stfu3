/** @type {import("eslint").Linter.Config} */
const config = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [],
  "rules": {}
};

module.exports = config;
