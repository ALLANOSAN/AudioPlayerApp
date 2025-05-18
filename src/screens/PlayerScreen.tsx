import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { Player } from '../components/Player';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

interface PlayerScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Player'>;
  // route é acessado dentro do componente Player usando useRoute()
}

export function PlayerScreen({ navigation }: PlayerScreenProps) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.name === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      <Player navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});