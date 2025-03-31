// @ts-check

import eslintPluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin'
import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default  tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
    },
  },
  {
    plugins: { 
      "unused-imports": unusedImports
    },
    rules: {
      "unused-imports/no-unused-vars": "error",
      "unused-imports/no-unused-imports": "error",
    },
  }
)