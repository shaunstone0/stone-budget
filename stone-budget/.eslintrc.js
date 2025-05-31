module.exports = {
  root: true,
  ignorePatterns: ["**/*"], // Prevent ESLint from linting everything until configs are extended
  overrides: [
    // Typescript files
    {
      files: ["*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["tsconfig.json"],
        createDefaultProgram: true,
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:@angular-eslint/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:prettier/recommended",
      ],
      rules: {
        // your custom TS rules here
      },
    },

    // Template files
    {
      files: ["*.html"],
      extends: ["plugin:@angular-eslint/template/recommended"],
      rules: {
        // your custom HTML rules here
      },
    },

    // Component inline templates
    {
      files: ["*.component.ts"],
      extends: ["plugin:@angular-eslint/template/process-inline-templates"],
    },
  ],
};
