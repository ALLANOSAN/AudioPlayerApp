import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AlbumsScreen from '../screens/AlbumsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongsScreen from '../screens/SongsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export default function TabsNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Songs" component={SongsScreen} options={{ title: 'Músicas' }} />
      <Tab.Screen name="Artists" component={ArtistsScreen} options={{ title: 'Artistas' }} />
      <Tab.Screen name="Albums" component={AlbumsScreen} options={{ title: 'Álbuns' }} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} options={{ title: 'Playlists' }} />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => <MaterialIcons name="settings" size={24} color="black" />,
        }}
      />
    </Tab.Navigator>
  );
}
