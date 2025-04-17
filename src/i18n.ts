import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Tolgee, DevTools, BackendFetch } from '@tolgee/react';
import ptbrTranslations from './locales/pt-br/pt-br.json';
import enTranslations from './locales/en/en.json';
import esTranslations from './locales/es/es.json';

export const tolgee = Tolgee()
  .use(DevTools())
  .use(BackendFetch())
  .init({
    apiUrl: 'https://app.tolgee.io',
    apiKey: 'SUA_CHAVE_TOLGEE',
    defaultLanguage: 'pt-br',
    availableLanguages: ['pt-BR', 'en', 'es'],
    fallbackLanguage: 'en',
  });

// Configuração específica para React Native
const initOptions: InitOptions = {
  lng: 'pt-BR',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    ptbr: { translation: ptbrTranslations },
    en: { translation: enTranslations },
    es: { translation: esTranslations }
  }
};

// Força compatibilidade com v3 para React Native
(initOptions as any).compatibilityJSON = 'v3';

i18n
  .use(initReactI18next)
  .init(initOptions);

export default i18n;
