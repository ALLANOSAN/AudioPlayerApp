import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactNative from 'eslint-plugin-react-native';
import eslintJs from '@eslint/js';

export default [
  // 0. Arquivos e pastas a serem ignorados globalmente
  {
    ignores: [
      '**/node_modules/**',
      '.expo/**', // Comum em projetos React Native com Expo
      'dist/**', // Pasta de build comum
      'babel.config.js',
      // Adicione outros padrões de ignore aqui, se necessário
    ],
  },

  // 1. Configuração base do ESLint (eslint:recommended)
  eslintJs.configs.recommended,

  // 2. Configuração base do TypeScript-ESLint (substitui plugin:@typescript-eslint/recommended)
  // tseslint.configs.recommended é um array, então precisa ser espalhado.
  // Isso já inclui o parser TypeScript e o plugin @typescript-eslint.
  ...tseslint.configs.recommended,
  // Se você precisar de regras que exigem informações de tipo (type-aware linting),
  // descomente a linha abaixo e certifique-se de que 'project' está configurado
  // em languageOptions.parserOptions no bloco de configuração relevante (veja o bloco 4).
  // ...tseslint.configs.recommendedTypeChecked,

  // 3. Configuração para React (substitui plugin:react/recommended)
  {
    files: ['**/*.{jsx,tsx}'], // Aplicar especificamente a arquivos JSX e TSX
    // pluginReact.configs.recommended é um objeto de configuração completo.
    // Ele inclui plugins, regras, e languageOptions (como parserOptions para JSX).
    ...pluginReact.configs.recommended,
    settings: {
      // 'settings' é uma propriedade de alto nível no objeto de configuração
      react: {
        version: 'detect', // Detecta automaticamente a versão do React
      },
    },
    rules: {
      // Você pode sobrescrever ou adicionar regras às recomendadas pelo React aqui.
      // As regras de pluginReact.configs.recommended já estão incluídas pelo spread acima.
      'react/react-in-jsx-scope': 'off', // Não é necessário com o novo JSX Transform do React
      'react/prop-types': 'off', // Útil se você estiver usando TypeScript para verificação de tipos de props
      // Adicione outras regras específicas do React aqui, se necessário
    },
    env: {
      node: true,
    },
  },

  // 4. Configuração para React Native e arquivos gerais do projeto (JS/TS)
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Aplica-se a todos os arquivos de código do projeto
    plugins: {
      'react-native': pluginReactNative,
      // Os plugins '@typescript-eslint' e 'react' já foram configurados
      // pelas camadas anteriores para os arquivos que correspondem aos seus padrões `files`.
    },
    languageOptions: {
      // O parser já foi definido por tseslint.configs.recommended.
      // Aqui, definimos parserOptions e globals que se aplicam a todos os arquivos.
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Garante que JSX seja habilitado para todos os arquivos relevantes
        },
        ecmaVersion: 2020, // Ou "latest"
        sourceType: 'module',
        // project: "./tsconfig.json", // Descomente se estiver usando recommendedTypeChecked
      },
      globals: {
        ...globals.browser, // Globals comuns para ambiente de navegador/React Native
        ...globals.es2021, // Ou a versão do ECMAScript que você está usando
        // ...globals.node, // Descomente se você tiver scripts Node.js no seu projeto
        __DEV__: 'readonly', // Global comum em ambientes React Native
      },
    },
    // A configuração 'settings' para React já foi definida no bloco 3.
    // Se este bloco tivesse um padrão `files` que não se sobrepusesse completamente
    // ou se você precisasse de settings diferentes, você poderia defini-los aqui.
    rules: {
      // Regras do eslint-plugin-react-native
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn', // Considere "off" ou ajuste conforme o estilo do seu projeto
      'react-native/no-color-literals': 'off', // Pode ser muito restritivo; ajuste conforme necessário
      'react-native/no-raw-text': 'warn', // Ajuda a garantir que todo texto esteja dentro de componentes <Text>

      // Suas regras personalizadas (do arquivo original)
      // Adicione suas regras personalizadas aqui. Por exemplo:
      // "indent": ["error", 2],
      // "semi": ["error", "always"],

      // Ajustes comuns de TypeScript (alguns podem já estar cobertos por tseslint.configs.recommended)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Adicione outras regras ou overrides globais conforme necessário
    },
  },
];
