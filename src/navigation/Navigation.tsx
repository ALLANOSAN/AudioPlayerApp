import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

// Importar telas
import PlayerScreen from '../screens/PlayerScreen';
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen';
import TabsNavigation from './TabsNavigation';
import { RootStackParamList } from '../types/navigation';

// Definindo o tipo correto para o Stack
const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { t } = useTranslate();
  const { theme } = useTheme();

  // Criar um tema customizado baseado no DefaultTheme
  const navigationTheme = {
    ...DefaultTheme,
    dark: theme.text === '#FFFFFF', // Uma forma simples de detectar tema escuro
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
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
            elevation: 0, // Para Android
            shadowOpacity: 0, // Para iOS
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: theme.background },
          // headerBackTitleVisible é apenas para iOS, remover se estiver causando erro
          // headerBackTitleVisible: false
        }}>
        <Stack.Screen name="Tabs" component={TabsNavigation} options={{ headerShown: false }} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            title: t('navegacao.player'),
          }}
        />
        <Stack.Screen
          name="AlbumDetails"
          component={AlbumDetailsScreen}
          options={({ route }) => {
            // Verificando qual propriedade existe no tipo Album
            // (pode ser 'title' ou outro nome em vez de 'name')
            const albumName =
              route.params && 'album' in route.params && route.params.album
                ? route.params.album.name || t('navegacao.detalhesAlbum')
                : t('navegacao.detalhesAlbum');

            return { title: albumName };
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
