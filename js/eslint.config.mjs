import { defaultConfig } from "@caido/eslint-config";

const utils = () => {
  return [
    {
      name: "utils",
      files: ["**/utils.ts"],
      rules: {
        "@typescript-eslint/no-restricted-types": "off",
      },
    }
  ]
}

/** @type {import('eslint').Linter.Config } */
export default [
  ...defaultConfig(),
  ...utils(),
]
