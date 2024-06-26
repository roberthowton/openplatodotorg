/** @type {import("prettier").Config} */
module.exports = {
  ...require("prettier-config-standard"),
  pluginSearchDirs: [__dirname],
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro"
      }
    }
  ]
};