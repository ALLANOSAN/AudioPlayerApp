import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongsScreen from '../screens/SongsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

export default function TabsNavigation() {
  const { t } = useTranslate();
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.tabBar },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarIndicatorStyle: { backgroundColor: theme.primary }
      }}
    >
      <Tab.Screen 
        name="Songs" 
        component={SongsScreen} 
        options={{ title: t('navegacao.musicas') }} 
      />
      <Tab.Screen 
        name="Artists" 
        component={ArtistsScreen} 
        options={{ title: t('navegacao.artistas') }} 
      />
      <Tab.Screen 
        name="Albums" 
        component={AlbumsScreen} 
        options={{ title: t('navegacao.albuns') }} 
      />
      <Tab.Screen 
        name="Playlists" 
        component={PlaylistsScreen} 
        options={{ title: t('navegacao.playlists') }} 
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => <MaterialIcons name="settings" size={24} color={theme.text} />,
          title: t('navegacao.configuracoes')
        }}
      />
    </Tab.Navigator>
  );
}