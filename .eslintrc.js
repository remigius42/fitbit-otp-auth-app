module.exports = {
  root: true,

  parserOptions: {
    parser: "@typescript-eslint/parser"
  },

  env: {
    browser: true,
    node: true
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],

  plugins: ["@typescript-eslint", "eslint-plugin-tsdoc"],

  rules: {
    "no-console": "error"
  },

  reportUnusedDisableDirectives: true,

  overrides: [
    {
      files: ["*.ts"],
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      parserOptions: {
        project: ["./tsconfig.json"]
      },
      rules: {
        "tsdoc/syntax": "error"
      }
    }
  ]
}
