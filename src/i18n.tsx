import React, { useState, useEffect, createContext, useContext, PropsWithChildren } from 'react';
import {
  TolgeeProvider as OfficialTolgeeProvider,
  useTranslate,
  TolgeeInstance,
  Tolgee,
} from '@tolgee/react';
// Corrigido: FormatSimple é importado de @tolgee/core
// Tipos para plugins customizados também de @tolgee/core
import {
  LanguageDetectorMiddleware,
  LanguageStorageMiddleware,
  TolgeePlugin,
  FormatSimple, // FormatSimple vem de @tolgee/core
  CommonProps, // Para a assinatura do setLanguage
} from '@tolgee/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import { Text } from 'react-native';
import Config from 'react-native-config';

import ptbrTranslations from './locales/pt-br/pt-br.json';
let enTranslationsLocal: any = {};
try {
  enTranslationsLocal = require('./locales/en/en.json');
} catch (e) { /* Arquivo não encontrado */ }

let esTranslationsLocal: any = {};
try {
  esTranslationsLocal = require('./locales/es/es.json');
} catch (e) { /* Arquivo não encontrado */ }

const LANGUAGE_STORAGE_KEY = 'app_language_tolgee';
const DEFAULT_LANGUAGE = 'pt-BR';

export type Language = 'pt-BR' | 'en' | 'es';

type TolgeeContextType = {
  tolgeeInstance: TolgeeInstance | null;
  loading: boolean;
  currentLang: Language;
  changeLanguage: (lang: Language) => Promise<void>;
};

const TolgeeContext = createContext<TolgeeContextType | null>(null);

// Plugin LanguageDetector customizado
const rnLanguageDetectorPlugin: TolgeePlugin = (tolgee, tools) => {
  const detector: LanguageDetectorMiddleware = {
    getLanguage(): Language | undefined {
      const locales = RNLocalize.getLocales();
      if (locales && locales.length > 0) {
        const langCode = locales[0].languageCode.split('-')[0] as Language;
        if ((['pt-BR', 'en', 'es'] as Language[]).includes(langCode)) {
          return langCode;
        }
      }
      return undefined;
    },
  };
  tools.setLanguageDetector(detector);
  return tolgee;
};

// Plugin LanguageStorage customizado
const rnLanguageStoragePlugin: TolgeePlugin = (tolgee, tools) => {
  const storage: LanguageStorageMiddleware = {
    async getLanguage(): Promise<string | undefined> { // Tolgee espera string | undefined
      const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      return lang ?? undefined;
    },
    async setLanguage(language: string, props: CommonProps): Promise<void> { // language é string
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    },
  };
  tools.setLanguageStorage(storage);
  return tolgee;
};

const fetchTolgeeTranslations = async (lang: string, apiUrl: string, apiKey: string) => {
  try {
    const response = await fetch(
      `${apiUrl}/v2/projects/translations/download?format=json&languages=${lang}`,
      { headers: { 'X-API-Key': apiKey } }
    );
    if (!response.ok) {
      console.error(`Falha ao baixar traduções para ${lang}. Status: ${response.status}`);
      return {};
    }
    const data = await response.json();
    return data[lang] || {};
  } catch (e) {
    console.error(`Erro na requisição ao baixar traduções para ${lang}:`, e);
    return {};
  }
};

export const TolgeeInstanceProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const tolgeeState = useTolgeeInstanceInternal();

  if (tolgeeState.loading || !tolgeeState.tolgeeInstance) {
    return <Text>Carregando idiomas...</Text>;
  }

  return (
    <OfficialTolgeeProvider tolgee={tolgeeState.tolgeeInstance}>
      <TolgeeContext.Provider value={tolgeeState}>{children}</TolgeeContext.Provider>
    </OfficialTolgeeProvider>
  );
};

const useTolgeeInstanceInternal = (): TolgeeContextType => {
  const [currentLang, setCurrentLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [loading, setLoading] = useState(true);
  const [tolgeeInstance, setTolgeeInstance] = useState<TolgeeInstance | null>(null);

  useEffect(() => {
    const initializeTolgee = async () => {
      setLoading(true);
      try {
        const apiUrl = Config.TOLGEE_API_URL;
        const apiKey = Config.TOLGEE_API_KEY;

        const staticData: Record<string, any> = { 'pt-BR': ptbrTranslations };
        if (Object.keys(enTranslationsLocal).length > 0) {
          staticData.en = enTranslationsLocal;
        } else if (apiKey && apiUrl) {
          staticData.en = await fetchTolgeeTranslations('en', apiUrl, apiKey);
        }
        if (Object.keys(esTranslationsLocal).length > 0) {
          staticData.es = esTranslationsLocal;
        } else if (apiKey && apiUrl) {
          staticData.es = await fetchTolgeeTranslations('es', apiUrl, apiKey);
        }

        const instance = Tolgee()
          .use(FormatSimple()) // FormatSimple() é uma função que retorna o plugin, importada de @tolgee/core
          .use(rnLanguageDetectorPlugin)
          .use(rnLanguageStoragePlugin)
          .init({
            apiKey: apiKey || undefined,
            apiUrl: apiUrl || undefined,
            defaultLanguage: DEFAULT_LANGUAGE,
            availableLanguages: ['pt-BR', 'en', 'es'],
            staticData: staticData,
          });

        await instance.run();

        setTolgeeInstance(instance);
        const langFromInstance = instance.getLanguage();
        if (langFromInstance && (['pt-BR', 'en', 'es'] as string[]).includes(langFromInstance)) {
          setCurrentLang(langFromInstance as Language);
        } else {
          setCurrentLang(DEFAULT_LANGUAGE);
        }

      } catch (error) {
        console.error('Erro ao inicializar Tolgee:', error);
        const fallbackInstance = Tolgee()
          .use(FormatSimple()) // Também aqui
          .init({
            defaultLanguage: DEFAULT_LANGUAGE,
            availableLanguages: ['pt-BR'],
            staticData: { 'pt-BR': ptbrTranslations },
          });
        await fallbackInstance.run();
        setTolgeeInstance(fallbackInstance);
        setCurrentLang(DEFAULT_LANGUAGE);
      } finally {
        setLoading(false);
      }
    };

    initializeTolgee();

    return () => {
      tolgeeInstance?.stop();
    };
  }, []);

  const changeLanguage = async (language: Language) => {
    if (!tolgeeInstance || loading) return;
    setLoading(true);
    try {
      await tolgeeInstance.changeLanguage(language);
      setCurrentLang(language);
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    tolgeeInstance,
    loading,
    currentLang,
    changeLanguage,
  };
};

export const useTolgeeInstance = (): TolgeeContextType => {
  const context = useContext(TolgeeContext);
  if (!context) {
    throw new Error('useTolgeeInstance deve ser usado dentro de um TolgeeInstanceProvider');
  }
  return context;
};

export { useTranslate };