import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

let en = {};
let ptBr = {};
let es = {};

try {
  en = require('./locales/en/common.json');
} catch (error) {
  console.warn('Warning: English translation file is missing. Using empty translations.');
}

try {
  ptBr = require('./locales/pt-br/common.json');
} catch (error) {
  console.warn('Warning: Portuguese translation file is missing. Using English fallback.');
}

try {
  es = require('./locales/es/common.json');
} catch (error) {
  console.warn('Warning: Spanish translation file is missing. Using English fallback.');
}

// Defining translation types
type Resources = {
  en: { translation: typeof en };
  "pt-br": { translation: typeof ptBr };
  es: { translation: typeof es };
};

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources;
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "pt-br": { translation: ptBr },
    es: { translation: es },
  },
  lng: 'pt-br',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false, // Return empty string instead of null when key is missing
});

export default i18n;
