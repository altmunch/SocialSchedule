import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to trim whitespace from global keys
function sanitizeGlobals(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.trim(), v])
  );
}

export default [
  {
    ignores: [
      '**/*.test.js',
      '**/*.spec.js',
      '**/__tests__/**/*.js',
    ],
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...typescriptEslint.configs['recommended'].rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*', '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...sanitizeGlobals(globals.jest),
        ...sanitizeGlobals(globals.node),
      },
    },
  },
  {
    files: [
      'src/components/**/*',
      'src/hooks/**/*',
      'src/app/**/*',
      'src/pages/**/*',
      'src/__tests__/**/*',
      'src/utils/**/*',
      'src/lib/**/*',
    ],
    languageOptions: {
      globals: {
        ...sanitizeGlobals(globals.browser),
        ...sanitizeGlobals(globals.node),
        React: 'writable',
      },
    },
  },
  {
    files: [
      'src/lib/**/*',
      'src/services/**/*',
      'src/utils/**/*',
      'src/instrumentation/**/*',
      'src/middleware.ts',
      'src/hooks/**/*',
    ],
    languageOptions: {
      globals: {
        ...sanitizeGlobals(globals.node),
        process: 'writable',
        Buffer: 'writable',
        console: 'writable',
      },
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/__tests__/**/*.js'],
    languageOptions: {
      parserOptions: {
        project: undefined,
      },
    },
  },
];
