module.exports = {
  // Parser
  parser: "@typescript-eslint/parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },

  // Plugins
  plugins: ["@typescript-eslint", "import"],

  // Configuration extensions
  extends: [
    // Eslint recommended
    "eslint:recommended",

    // @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",

    // eslint-config-prettier
    "plugin:prettier/recommended",

    // eslint-plugin-import
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],

  // Settings
  settings: {
    "import/resolver": {
      // Use eslint-import-resolver-typescript
      typescript: {},
    },
  },

  // Rules
  rules: {
    // Disabled
    "no-empty-pattern": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-implied-eval": "off",
    "@typescript-eslint/unbound-method": "off",

    // Disabled for performance issues
    // Reference: https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import
    "import/namespace": "off",

    // Disable no-unused-vars and uses noUnusedLocals: true in tsconfig.json instead
    // Reference: https://github.com/johnsoncodehk/volar/issues/47
    "@typescript-eslint/no-unused-vars": "off",

    // Enabled
    "sort-imports": [
      "warn",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        warnOnUnassignedImports: true,
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
  },

  // Rule exceptions
  overrides: [
    {
      files: ["src/**/*.spec.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      files: ["./**/*.cjs"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
};
