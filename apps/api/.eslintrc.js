/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/server.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  rules: { "no-unused-vars": "off", "@typescript-eslint/no-unused-vars": [ "error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true, "argsIgnorePattern": "^_" } ] }
};
