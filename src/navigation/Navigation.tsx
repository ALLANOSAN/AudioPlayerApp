import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigation from './TabsNavigation';
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        cardStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabsNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlbumDetails"
        component={AlbumDetailsScreen}
        options={{ title: 'Detalhes do Álbum' }}
      />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ 
          title: 'Player de Música',
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
}