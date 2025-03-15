import React, { createContext, useState, useContext, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Traduções disponíveis
export const translations = {
  pt: {
    // Geral
    appName: 'App de Áudio',
    loading: 'Carregando...',
    search: 'Buscar',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    back: 'Voltar',
    
    // Navegação
    songs: 'Músicas',
    albums: 'Álbuns',
    artists: 'Artistas',
    playlists: 'Playlists',
    player: 'Reprodutor',
    settings: 'Configurações',
    
    // Tela de músicas
    addSongs: 'Adicionar Músicas',
    searchPlaceholder: 'Buscar músicas, artistas ou álbuns...',
    emptyLibrary: 'Sua biblioteca está vazia. Adicione músicas para começar!',
    noResults: 'Nenhuma música encontrada para "{query}"',
    loadingSongs: 'Carregando músicas...',
    
    // Tela de álbuns
    albumDetails: 'Detalhes do Álbum',
    songCount: '{count} músicas',
    playAll: 'Reproduzir Todas',
    
    // Player
    previous: 'Anterior',
    play: 'Reproduzir',
    pause: 'Pausar',
    next: 'Próxima',
    shuffle: 'Aleatório',
    repeat: 'Repetir',
    
    // Configurações
    darkTheme: 'Tema Escuro',
    lightTheme: 'Tema Claro',
    language: 'Idioma',
    about: 'Sobre',
    version: 'Versão',
  },
  en: {
    // General
    appName: 'Audio App',
    loading: 'Loading...',
    search: 'Search',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    
    // Navigation
    songs: 'Songs',
    albums: 'Albums',
    artists: 'Artists',
    playlists: 'Playlists',
    player: 'Player',
    settings: 'Settings',
    
    // Songs screen
    addSongs: 'Add Songs',
    searchPlaceholder: 'Search songs, artists or albums...',
    emptyLibrary: 'Your library is empty. Add songs to get started!',
    noResults: 'No songs found for "{query}"',
    loadingSongs: 'Loading songs...',
    
    // Album screen
    albumDetails: 'Album Details',
    songCount: '{count} songs',
    playAll: 'Play All',
    
    // Player
    previous: 'Previous',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    shuffle: 'Shuffle',
    repeat: 'Repeat',
    
    // Settings
    darkTheme: 'Dark Theme',
    lightTheme: 'Light Theme',
    language: 'Language',
    about: 'About',
    version: 'Version',
  },
  es: {
    // General
    appName: 'App de Audio',
    loading: 'Cargando...',
    search: 'Buscar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Volver',
    
    // Navigation
    songs: 'Canciones',
    albums: 'Álbumes',
    artists: 'Artistas',
    playlists: 'Listas',
    player: 'Reproductor',
    settings: 'Ajustes',
    
    // Songs screen
    addSongs: 'Añadir Canciones',
    searchPlaceholder: 'Buscar canciones, artistas o álbumes...',
    emptyLibrary: '¡Tu biblioteca está vacía. Añade canciones para empezar!',
    noResults: 'No se encontraron canciones para "{query}"',
    loadingSongs: 'Cargando canciones...',
    
    // Album screen
    albumDetails: 'Detalles del Álbum',
    songCount: '{count} canciones',
    playAll: 'Reproducir Todo',
    
    // Player
    previous: 'Anterior',
    play: 'Reproducir',
    pause: 'Pausar',
    next: 'Siguiente',
    shuffle: 'Aleatorio',
    repeat: 'Repetir',
    
    // Settings
    darkTheme: 'Tema Oscuro',
    lightTheme: 'Tema Claro',
    language: 'Idioma',
    about: 'Acerca de',
    version: 'Versión',
  }
};

type Language = 'pt' | 'en' | 'es';
type TranslationType = typeof translations.pt;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationType, params?: Record<string, string | number>) => string;
  availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Obter o idioma do dispositivo
const getDeviceLanguage = (): Language => {
  try {
    let deviceLanguage = 'pt';
    
    if (Platform.OS === 'ios') {
      const iosSettings = NativeModules.SettingsManager?.settings;
      deviceLanguage = iosSettings?.AppleLocale || 
                      (iosSettings?.AppleLanguages && iosSettings.AppleLanguages[0]) || 'pt';
    } else {
      // Verificar se I18nManager existe e tem a propriedade localeIdentifier
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'pt';
    }
    
    // Extrair código de idioma (primeiros 2 caracteres)
    const languageCode = deviceLanguage.substring(0, 2);
    
    // Verificar se o idioma é suportado
    if (['pt', 'en', 'es'].includes(languageCode)) {
      return languageCode as Language;
    }
    
    return 'pt'; // Idioma padrão
  } catch (error) {
    console.error('Erro ao obter idioma do dispositivo:', error);
    return 'pt'; // Retornar idioma padrão em caso de erro
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getDeviceLanguage());
  
  const availableLanguages = [
    { code: 'pt' as Language, name: 'Português' },
    { code: 'en' as Language, name: 'English' },
    { code: 'es' as Language, name: 'Español' }
  ];
  
  // Carregar preferência de idioma salva
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@language_preference');
        if (savedLanguage !== null && ['pt', 'en', 'es'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de idioma:', error);
      }
    };
    
    loadLanguagePreference();
  }, []);
  
  // Função para alterar o idioma
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('@language_preference', lang);
    } catch (error) {
      console.error('Erro ao salvar preferência de idioma:', error);
    }
  };
  
  // Função para obter traduções com suporte a parâmetros
  const t = (key: keyof TranslationType, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations.pt[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return text;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage deve ser usado dentro de um LanguageProvider');
  }
  return context;
}; 