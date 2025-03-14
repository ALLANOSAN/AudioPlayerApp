import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import AlbumsScreen from './src/screens/AlbumsScreen';
import ArtistsScreen from './src/screens/ArtistsScreen';
import MusicScreen from './src/screens/SongsScreen';
import PlaylistsScreen from './src/screens/PlaylistsScreen';
import PlayerScreen from './src/screens/PlayerScreen';  // Importando como exportação padrão

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

type RootStackParamList = {
  Tabs: undefined;
  Player: {
    song: Song;
  };
};

interface Song {
  path: string;
  name: string;
  cover: string;
  artist: string;
  album: string;
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Music" component={MusicScreen} />
      <Tab.Screen name="Albums" component={AlbumsScreen} />
      <Tab.Screen name="Artists" component={ArtistsScreen} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} />
    </Tab.Navigator>
  );
}

export default App;
