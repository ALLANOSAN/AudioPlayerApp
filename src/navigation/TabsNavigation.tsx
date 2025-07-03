import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Alterado
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react';
import { Platform } from 'react-native';

// Importar suas telas
import SongsScreen from '../screens/SongsScreen';
import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { TabParamList } from '../types/navigation'; // Seus tipos de navegação

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabsNavigation() {
  const { theme } = useTheme();
  const { t } = useTranslate();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'audiotrack'; // default

          if (route.name === 'Music') {
            iconName = focused ? 'music-note' : 'music-note';
          } else if (route.name === 'Albums') {
            iconName = focused ? 'album' : 'album';
          } else if (route.name === 'Artists') {
            iconName = focused ? 'mic' : 'mic';
          } else if (route.name === 'Playlists') {
            iconName = focused ? 'playlist-play' : 'playlist-play';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === 'ios' ? 15 : 5, // Ajuste para safe area no iOS
          height: Platform.OS === 'ios' ? 80 : 60, // Altura da tab bar
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          paddingBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}>
      <Tab.Screen
        name="Music"
        component={SongsScreen}
        options={{ title: t('navegacao.musicas') }}
      />
      <Tab.Screen
        name="Albums"
        component={AlbumsScreen}
        options={{ title: t('navegacao.albuns') }}
      />
      <Tab.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{ title: t('navegacao.artistas') }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{ title: t('navegacao.playlists') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('navegacao.configuracoes') }}
      />
    </Tab.Navigator>
  );
}
