import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import Navigation from './src/navigation/Navigation';
import { TolgeeInstanceProvider, useTolgeeInstance } from './src/i18n';
import { TolgeeProvider } from '@tolgee/react';

// Componente interno que utiliza o hook de Tolgee
const TolgeeWrappedApp = () => {
  const { tolgeeInstance, loading } = useTolgeeInstance();

  if (loading || !tolgeeInstance) {
    return <Text>Carregando...</Text>;
  }

  return (
    <TolgeeProvider tolgee={tolgeeInstance} fallback="Carregando...">
      <ThemeProvider>
        <StatusBar barStyle="light-content" />
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </ThemeProvider>
    </TolgeeProvider>
  );
};

// Componente principal com o Provider
const App = () => {
  return (
    <TolgeeInstanceProvider>
      <TolgeeWrappedApp />
    </TolgeeInstanceProvider>
  );
};

export default App;
