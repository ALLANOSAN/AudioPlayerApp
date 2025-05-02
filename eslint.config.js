import { defineConfig } from 'eslint-define-config';

export default defineConfig([
  {
    ignores: ['**/node_modules/**'],
  },
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: ['react-native'],
    rules: {
      // Adicione suas regras personalizadas aqui
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
]);
