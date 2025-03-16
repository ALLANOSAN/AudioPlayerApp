import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import TabsNavigation from './TabsNavigation'; // Tab Navigator para a tela principal
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen'; // Tela para os detalhes do álbum
import PlayerScreen from '../screens/PlayerScreen'; // Tela para o player
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Tab Navigator para a tela principal */}
        <Stack.Screen
          name="Tabs"
          component={TabsNavigation}
          options={{ headerShown: false }} // Esconde o cabeçalho do Stack Navigator
        />
        {/* Tela de Detalhes do Álbum */}
        <Stack.Screen
          name="AlbumDetails"
          component={AlbumDetailsScreen}
          options={{ title: 'Detalhes do Álbum' }}
        />
        {/* Tela do Player */}
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ title: 'Player de Música' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
