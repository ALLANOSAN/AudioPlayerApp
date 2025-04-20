import React, { useState, useEffect, createContext, useContext } from 'react';
import { TolgeeCore } from '@tolgee/core';
import { TolgeeProvider, useTranslate } from '@tolgee/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Config from 'react-native-config';

// Importar os arquivos de tradução local como fallback
import ptbrTranslations from './locales/pt-br/pt-br.json';
import enTranslations from './locales/en/en.json';
import esTranslations from './locales/es/es.json';

// Chave para armazenar o idioma no AsyncStorage
const LANGUAGE_STORAGE_KEY = 'user_language';
const DEFAULT_LANGUAGE = 'pt-BR';

// Definir tipos para melhor suporte TypeScript
type Language = 'pt-BR' | 'en' | 'es';

// Definir tipo correto para a instância Tolgee - ajuste isso com o tipo correto
type TolgeeInstanceType = any; // Usar any temporariamente para resolver os erros de tipagem

type TolgeeContextType = {
  tolgeeInstance: TolgeeInstanceType;
  loading: boolean;
  currentLang: Language;
  changeLanguage: (lang: Language) => Promise<void>;
};

// Criar contexto para evitar problemas de estado
const TolgeeContext = createContext<TolgeeContextType | null>(null);

// Provider que vai envolver a aplicação
export const TolgeeInstanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tolgeeState = useTolgeeInstanceInternal();

  // Adicionar verificação de carregamento explícita
  if (tolgeeState.loading || !tolgeeState.tolgeeInstance) {
    return <Text>Carregando...</Text>;
  }

  return <TolgeeContext.Provider value={tolgeeState}>{children}</TolgeeContext.Provider>;
};

// Hook interno para usar dentro do provider
const useTolgeeInstanceInternal = (): TolgeeContextType => {
  // Tipo de retorno explícito
  const [currentLang, setCurrentLang] = useState<Language>(DEFAULT_LANGUAGE);
  const [loading, setLoading] = useState(true);
  const [tolgeeInstance, setTolgeeInstance] = useState<TolgeeInstanceType | null>(null);

  // Inicializa e carrega o idioma salvo
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Tenta carregar o idioma salvo
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        // Usa o idioma salvo ou o padrão
        const languageToUse = (savedLanguage as Language) || DEFAULT_LANGUAGE;

        // Cria a instância do Tolgee com o idioma correto
        const instance = TolgeeCore().init({
          apiUrl: Config.TOLGEE_API_URL || 'https://app.tolgee.io',
          apiKey: Config.TOLGEE_API_KEY || 'SUA_CHAVE_TOLGEE',
          language: languageToUse,
          availableLanguages: ['pt-BR', 'en', 'es'],
          staticData: {
            'pt-BR': ptbrTranslations,
            en: enTranslations,
            es: esTranslations,
          },
        });

        setCurrentLang(languageToUse);
        setTolgeeInstance(instance as TolgeeInstanceType); // Usando cast para resolver o erro de tipagem
      } catch (error) {
        console.error('Erro ao carregar idioma:', error);

        // Fallback para instância com idioma padrão em caso de erro
        const fallbackInstance = TolgeeCore().init({
          language: DEFAULT_LANGUAGE,
          staticData: {
            'pt-BR': ptbrTranslations,
            en: enTranslations,
            es: esTranslations,
          },
        });

        setTolgeeInstance(fallbackInstance as TolgeeInstanceType); // Usando cast para resolver o erro de tipagem
      } finally {
        setLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Função para mudar o idioma e persistir a escolha
  const changeLanguage = async (language: Language) => {
    try {
      // Salva o novo idioma
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

      // Atualiza o Tolgee - usando método dinâmico para contornar o erro de tipagem
      if (tolgeeInstance) {
        const instance = tolgeeInstance as any;
        if (typeof instance.changeLanguage === 'function') {
          await instance.changeLanguage(language);
        }
      }

      // Atualiza o estado
      setCurrentLang(language);
    } catch (error) {
      console.error('Erro ao mudar idioma:', error);
    }
  };

  return {
    tolgeeInstance: tolgeeInstance as TolgeeInstanceType,
    loading,
    currentLang,
    changeLanguage,
  };
};

// Hook para componentes consumirem o contexto
export const useTolgeeInstance = (): TolgeeContextType => {
  const context = useContext(TolgeeContext);
  if (!context) {
    throw new Error('useTolgeeInstance deve ser usado dentro de TolgeeInstanceProvider');
  }
  return context;
};

// Exportar componentes necessários
export { TolgeeProvider, useTranslate };

// Componente de seletor de idioma reutilizável
interface LanguageSelectorProps {
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ style }) => {
  // Usar try/catch para lidar com o caso em que o Provider não está disponível
  let currentLang = DEFAULT_LANGUAGE;
  let changeLanguage = async (lang: Language) => {
    console.warn('Provider não encontrado, mudança de idioma não funcionará');
  };

  try {
    const context = useTolgeeInstance();
    currentLang = context.currentLang;
    changeLanguage = context.changeLanguage;
  } catch (error) {
    console.error('Erro ao acessar o contexto Tolgee:', error);
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, currentLang === 'pt-BR' ? styles.activeButton : undefined]}
        onPress={() => changeLanguage('pt-BR')}>
        <Text style={styles.buttonText}>Português</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, currentLang === 'en' ? styles.activeButton : undefined]}
        onPress={() => changeLanguage('en')}>
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, currentLang === 'es' ? styles.activeButton : undefined]}
        onPress={() => changeLanguage('es')}>
        <Text style={styles.buttonText}>Español</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 14,
  },
});
