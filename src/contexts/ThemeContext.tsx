import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';

// Definindo os temas
export const lightTheme = {
  background: '#f5f5f5',
  card: '#ffffff',
  cardItem: '#f0f0f0', // Adicione esta linha
  text: '#333333',
  secondaryText: '#666666',
  tertiaryText: '#888888',
  primary: '#FAFAFA',
  secondary: '#607D8B',
  border: '#e0e0e0',
  placeholder: '#ddd',
  shadow: '#000000',
  tabBar: '#ffffff',
  statusBar: 'dark-content',
  error: '#d32f2f', // vermelho para erros
  buttonText: '#333333', // cor para texto de botão claro
};

export const darkTheme = {
  background: '#121212',
  card: '#1e1e1e',
  cardItem: '#424242', // Adicione esta linha
  text: '#ffffff',
  secondaryText: '#b0b0b0',
  tertiaryText: '#909090',
  primary: '#000000',
  secondary: '#78909C',
  border: '#2c2c2c',
  placeholder: '#2a2a2a',
  shadow: '#000000',
  tabBar: '#1a1a1a',
  statusBar: 'light-content',
  error: '#ef5350', // vermelho claro para erros em dark mode
  buttonText: '#ffffff', // cor para texto de botão escuro
};

type Theme = typeof lightTheme;

// Função para adaptar para o tema do React Navigation
const toNavigationTheme = (theme: Theme, isDark: boolean): NavigationTheme => ({
  dark: isDark,
  colors: {
    ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
    background: theme.background,
    card: theme.card,
    text: theme.text,
    border: theme.border,
    primary: theme.primary,
    notification: (isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors)
      .notification,
  },
  fonts: isDark ? NavigationDarkTheme.fonts : NavigationDefaultTheme.fonts, // Adicione esta linha
});

interface ThemeContextType {
  theme: Theme;
  navigationTheme: NavigationTheme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(deviceTheme === 'dark');

  // Carregar preferência de tema salva
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          setIsDark(deviceTheme === 'dark');
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Salvar preferência de tema quando mudar
  useEffect(() => {
    const saveThemePreference = async () => {
      try {
        await AsyncStorage.setItem('@theme_preference', isDark ? 'dark' : 'light');
      } catch (error) {
        console.error('Erro ao salvar preferência de tema:', error);
      }
    };

    saveThemePreference();
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? darkTheme : lightTheme;
  const navigationTheme = toNavigationTheme(theme, isDark);

  return (
    <ThemeContext.Provider value={{ theme, navigationTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
