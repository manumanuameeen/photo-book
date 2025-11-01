module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json"
  },
  env: {
    node: true,
    es2021: true
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "warn"
  }
};
