const js = require("@eslint/js");
const vue = require("eslint-plugin-vue");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

// Convert WXT auto-import globals (legacy true/false) to flat-config "readonly"/"writable"
const wxtGlobalsRaw = require("./.wxt/eslintrc-auto-import.json").globals;
const wxtGlobals = Object.fromEntries(
  Object.entries(wxtGlobalsRaw).map(([k, writable]) => [
    k,
    writable ? "writable" : "readonly",
  ]),
);

module.exports = [
  // Global ignores
  {
    ignores: [
      ".output/",
      ".wxt/",
      "node_modules/",
      "dist/",
      "artifacts/",
      "safari/",
    ],
  },

  // JS recommended
  js.configs.recommended,

  // Vue 3 essential (matches legacy plugin:vue/vue3-essential)
  ...vue.configs["flat/essential"],

  // Prettier (disables conflicting formatting rules + runs prettier as a rule)
  prettierRecommended,

  // Project-wide settings
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.webextensions,
        ...wxtGlobals,
      },
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      "vue/multi-word-component-names": "off",
      "vue/no-reserved-component-names": "off",
    },
  },
];
