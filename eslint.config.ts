import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      globals: globals.browser,
      parser: tsParser,
      sourceType: 'module',
    },

    files: ['**/*.ts'],
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'eol-last': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  }
);
