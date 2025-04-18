import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextProvider } from 'react-i18next';
import { TolgeeProvider, Tolgee, DevTools, FormatSimple } from '@tolgee/react';
import i18n from './src/i18n';
import { ThemeProvider } from './src/contexts/ThemeContext';
import Navigation from './src/navigation/Navigation';

// Importar variáveis de ambiente
import Config from 'react-native-config';

// Carregar o idioma salvo do AsyncStorage
const loadLanguage = async () => {
  const storedLang = await AsyncStorage.getItem('language');
  return storedLang ?? 'pt-BR';  // Se não houver idioma salvo, usar pt-BR
};

const App = () => {
  const [currentLang, setCurrentLang] = useState<'en' | 'pt-BR' | 'es'>('pt-BR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = await loadLanguage();
      if (savedLanguage === 'en' || savedLanguage === 'es' || savedLanguage === 'pt-BR') {
        setCurrentLang(savedLanguage);
      } else {
        setCurrentLang('pt-BR');
      }
      setLoading(false);
    };
    initializeLanguage();
  }, []);

  if (loading) {
    return <Text>Carregando...</Text>; // Exibir uma tela de carregamento até o idioma ser carregado
  }

  // Configuração do Tolgee com o idioma atual
  const tolgeeInstance = Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language: currentLang,
      apiUrl: Config.TOLGEE_API_URL,  // Usar a variável de ambiente para a URL
      apiKey: Config.TOLGEE_API_KEY,  // Usar a variável de ambiente para a chave
      staticData: {
        en: require('./src/locales/en.json'),
        'pt-BR': require('./src/locales/pt-br/pt-br.json'),
        es: require('./src/locales/es/es.json')
      }
    });

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
};

export default App;
