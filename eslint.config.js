import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  languageOptions: {
    parser: '@typescript-eslint/parser', // Define o parser para TypeScript
    parserOptions: {
      ecmaFeatures: {
        jsx: true, // Permite o uso de JSX
      },
      ecmaVersion: 2020, // Permite o uso de ES2020
      sourceType: 'module', // Permite o uso de módulos ES6
    },
  },
  extends: [
    'eslint:recommended', // Regras recomendadas do ESLint
    'plugin:react/recommended', // Regras recomendadas do plugin React
    'plugin:@typescript-eslint/recommended', // Regras recomendadas do plugin TypeScript
  ],
  rules: {
    // Adicione suas regras personalizadas aqui
  },
  settings: {
    react: {
      version: 'detect', // Detecta automaticamente a versão do React
    },
  },
});