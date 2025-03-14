import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Player } from '../components/Player';  // Importando o componente Player
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Song {
  path: string;
  name: string;
  cover: string;
  artist: string;
  album: string;
}

type RootStackParamList = {
  Player: {
    song: Song;
  };
};

type PlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
type PlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

interface PlayerScreenProps {
  route: PlayerScreenRouteProp;
  navigation: PlayerScreenNavigationProp;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ route, navigation }) => {
  const { song } = route.params;  // Recebe a música selecionada

  return (
    <View style={styles.container}>
      <Player currentSong={song} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default PlayerScreen;  // Usando exportação padrão
