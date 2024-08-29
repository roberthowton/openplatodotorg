/** @type {import("prettier").Config} */
export default {
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