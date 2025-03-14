import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: { ...globals.browser, Phaser: "readonly" } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "no-undef": "warn",
            "@typescript-eslint/no-require-imports": "warn",
        },
    },
];
