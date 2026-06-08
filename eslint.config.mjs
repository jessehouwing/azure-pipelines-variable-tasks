import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/build/**', '**/*.d.ts', '**/src/__tests__/**', '**/*.js', '**/*.mjs'],
  },
  js.configs.recommended,
  {
    plugins: { '@typescript-eslint': tseslint.plugin },
    files: ['vsts-variable-*/*/src/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
        sourceType: 'module',
      },
    },
    rules: {
      ...tseslint.configs.eslintRecommended.rules,
      ...tseslint.plugin.configs.recommended.rules,
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-control-regex': 'off',
    },
  },
);