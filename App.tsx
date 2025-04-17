import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/react';
import i18n from './src/i18n';
import { ThemeProvider } from './src/contexts/ThemeContext';
import Navigation from './src/navigation/Navigation';

// Configuração do Tolgee
const tolgeeInstance = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  .init({
    language: 'pt',
    apiUrl: process.env.VITE_APP_TOLGEE_API_URL || 'https://app.tolgee.io',
    apiKey: process.env.VITE_APP_TOLGEE_API_KEY || 'sua_chave_aqui',
    staticData: {
      en: require('./src/locales/en.json'),
      pt: require('./src/locales/pt.json')
    }
  });

function App() {
  return (
    <TolgeeProvider tolgee={tolgeeInstance} fallback="Carregando...">
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <StatusBar barStyle="light-content" />
          <Navigation />
        </ThemeProvider>
      </I18nextProvider>
    </TolgeeProvider>
  );
}

export default App;