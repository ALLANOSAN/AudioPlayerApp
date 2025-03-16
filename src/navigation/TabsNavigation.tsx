import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongsScreen from '../screens/SongsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabsNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Albums" component={AlbumsScreen} options={{ title: 'Álbuns' }} />
      <Tab.Screen name="Artists" component={ArtistsScreen} options={{ title: 'Artistas' }} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} options={{ title: 'Playlists' }} />
      <Tab.Screen name="Songs" component={SongsScreen} options={{ title: 'Músicas' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
    </Tab.Navigator>
  );
}