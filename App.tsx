import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { enableScreens } from 'react-native-screens';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { Easing } from 'react-native-reanimated';
import { StatusBar, StatusBarStyle } from 'react-native';

// Internacionalização
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/i18n'; // Importação do arquivo de configuração do i18n

// Contextos
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Telas
import AlbumsScreen from './src/screens/AlbumsScreen';
import ArtistsScreen from './src/screens/ArtistsScreen';
import MusicScreen from './src/screens/SongsScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { AlbumDetailsScreen } from './src/screens/AlbumDetailsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Tipos
import { RootStackParamList, TabParamList } from './src/types/navigation';

// Serviços
import { NotificationService } from './src/services/NotificationService';
import { downloadTranslations } from './src/services/crowdinService';

// Habilitar otimizações de tela nativa
enableScreens();

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// Configurações de animação para transições de tela
const screenOptions = {
  headerShown: true,
  gestureEnabled: true,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 250,
        easing: Easing.in(Easing.poly(4)),
      },
    },
  },
};

// Componente de conteúdo de navegação (sem NavigationContainer)
function AppNavigatorContent() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation(); // Usando react-i18next para acessar traduções

  // Inicializar o serviço de notificações
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        // Obtenha a instância e depois chame o método setup()
        const notificationService = NotificationService.getInstance();
        await notificationService.setup();
      } catch (error) {
        console.error('Erro ao configurar o player:', error);
      }
    };

    setupPlayer();
  }, []);

  // Criar um tema personalizado para o NavigationContainer
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
  };

  return (
    <>
      <StatusBar backgroundColor={theme.background} barStyle={theme.statusBar as StatusBarStyle} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Tabs"
          screenOptions={{
            ...screenOptions,
            headerStyle: {
              backgroundColor: theme.card,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: theme.text,
          }}>
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              headerShown: false,
              title: t('appName'), // Chama a tradução para o título do app
            }}
          />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{
              title: t('player'), // Tradução para "Player"
              cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
            }}
          />
          <Stack.Screen
            name="AlbumDetails"
            component={AlbumDetailsScreen}
            options={{
              title: t('albumDetails'), // Tradução para "Detalhes do Álbum"
            }}
          />
          <Stack.Screen
            name="ArtistDetails"
            options={{
              title: t('artists'), // Tradução para "Artistas"
            }}
            component={ArtistsScreen}
          />
          <Stack.Screen
            name="PlaylistDetails"
            options={{
              title: t('playlists'), // Tradução para "Playlists"
            }}
            component={PlaylistsScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function TabNavigator() {
  const { theme } = useTheme();
  const { t } = useTranslation(); // Usando react-i18next para traduções

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tertiaryText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 8,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: theme.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
      }}>
      <Tab.Screen
        name="Music"
        component={MusicScreen}
        options={{
          title: t('songs'),
          tabBarLabel: t('songs'), // Tradução para "Músicas"
        }}
      />
      <Tab.Screen
        name="Albums"
        component={AlbumsScreen}
        options={{
          title: t('albums'),
          tabBarLabel: t('albums'), // Tradução para "Álbuns"
        }}
      />
      <Tab.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{
          title: t('artists'),
          tabBarLabel: t('artists'), // Tradução para "Artistas"
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          title: t('playlists'),
          tabBarLabel: t('playlists'), // Tradução para "Playlists"
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings'),
          tabBarLabel: t('settings'), // Tradução para "Configurações"
        }}
      />
    </Tab.Navigator>
  );
}

// Componente raiz com providers
function App() {
  useEffect(() => {
    const syncTranslations = async () => {
      try {
        await downloadTranslations('pt'); // Sincroniza traduções ao iniciar o app
        console.log('Traduções sincronizadas com sucesso!');
      } catch (error) {
        console.error('Erro ao sincronizar traduções:', error);
      }
    };

    syncTranslations();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AppNavigatorContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
