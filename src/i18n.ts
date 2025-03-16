import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importando arquivos de tradução
import en from './locales/en/common.json';
import pt from './locales/pt-br/common.json';
import es from './locales/es/common.json';

// Definindo o tipo das traduções
type Resources = {
  en: { translation: typeof en };
  pt: { translation: typeof pt };
  es: { translation: typeof es };
};

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: Resources;
  }
}

// Configuração do i18n com TypeScript
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, // Traduções em inglês
    pt: { translation: pt }, // Traduções em português
    es: { translation: es }, // Traduções em espanhol
  },
  lng: 'pt', // Idioma padrão
  fallbackLng: 'pt', // Fallback para o idioma padrão
  interpolation: {
    escapeValue: false, // React já faz o escape automaticamente
  },
});

export default i18n;
