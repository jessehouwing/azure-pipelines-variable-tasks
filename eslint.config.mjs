import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.commonjs,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "no-control-regex": "off",
        },
    },
);