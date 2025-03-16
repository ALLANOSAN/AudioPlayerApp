import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Song } from '../types/song';
import { useNavigation } from '@react-navigation/native';
import { SongList } from '../components/SongList';
import TrackPlayer from 'react-native-track-player';

type AlbumDetailsRouteProp = RouteProp<RootStackParamList, 'AlbumDetails'>;
type AlbumDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetails'>;

interface AlbumDetailsScreenProps {
  route: AlbumDetailsRouteProp;
  navigation: AlbumDetailsNavigationProp;
}

export function AlbumDetailsScreen({ route, navigation }: AlbumDetailsScreenProps) {
  const { album } = route.params || {}; // Adiciona proteção caso o parâmetro esteja ausente
  const playerNavigation = useNavigation<StackNavigationProp<RootStackParamList, 'Player'>>();
  const [isLoading, setIsLoading] = useState(false); // Feedback de carregamento

  // Validação se o álbum não foi passado
  if (!album) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Álbum não encontrado.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonTop}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shuffleSongs = (songs: Song[]) => [...songs].sort(() => Math.random() - 0.5); // Embaralha as músicas

  const prepareTracks = (songs: Song[]) =>
    songs.map(song => ({
      id: song.path,
      url: song.path,
      title: song.name,
      artist: song.artist,
      album: song.album,
      artwork: song.cover || undefined,
    }));

  const handlePlaySong = async (song: Song) => {
    setIsLoading(true);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(prepareTracks([song]));
      await TrackPlayer.play();
      playerNavigation.navigate('Player', { song });
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = async () => {
    if (album.songs.length === 0) return;
    setIsLoading(true);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(prepareTracks(album.songs));
      await TrackPlayer.play();
      playerNavigation.navigate('Player', { song: album.songs[0] });
    } catch (error) {
      console.error('Erro ao reproduzir álbum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShufflePlay = async () => {
    if (album.songs.length === 0) return;
    setIsLoading(true);
    try {
      const shuffledSongs = shuffleSongs(album.songs);
      await TrackPlayer.reset();
      await TrackPlayer.add(prepareTracks(shuffledSongs));
      await TrackPlayer.play();
      playerNavigation.navigate('Player', { song: shuffledSongs[0] });
    } catch (error) {
      console.error('Erro ao reproduzir músicas aleatórias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      "Voltar",
      "Deseja voltar? Isso pode interromper a reprodução.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Voltar", onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar no Topo */}
      <TouchableOpacity style={styles.backButtonTop} onPress={handleBackPress} accessibilityLabel="Voltar para a tela anterior">
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        {album.cover ? (
          <FastImage
            source={{
              uri: album.cover,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.albumCover}
          />
        ) : (
          <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
            <Text style={styles.albumCoverPlaceholderText}>{album.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.name}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          <Text style={styles.songCount}>{album.songs.length} músicas</Text>
        </View>
      </View>

      {/* Spinner de Carregamento */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      {/* Botões de Ação */}
      <TouchableOpacity style={styles.playAllButton} onPress={handlePlayAll} accessibilityLabel="Reproduzir todas as músicas do álbum">
        <Text style={styles.playAllButtonText}>Reproduzir Todas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shuffleButton} onPress={handleShufflePlay} accessibilityLabel="Reproduzir músicas do álbum em ordem aleatória">
        <Text style={styles.shuffleButtonText}>Reproduzir Aleatoriamente</Text>
      </TouchableOpacity>

      {/* Lista de Músicas */}
      <SongList
        songs={album.songs}
        onSelectSong={handlePlaySong}
        style={styles.songsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButtonTop: {
    backgroundColor: '#607D8B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  albumCoverPlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCoverPlaceholderText: {
    fontSize: 48,
    color: '#888',
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  albumArtist: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  songCount: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  playAllButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  playAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  shuffleButton: {
    backgroundColor: '#FFC107',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  shuffleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  songsList: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E57373',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default AlbumDetailsScreen;
