import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Album } from '../types/album';
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
  const { album } = route.params;
  const playerNavigation = useNavigation<StackNavigationProp<RootStackParamList, 'Player'>>();

  const handlePlaySong = async (song: Song) => {
    try {
      // Resetar o player e adicionar a música selecionada
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: song.path,
        url: song.path,
        title: song.name,
        artist: song.artist,
        album: song.album,
        artwork: song.cover || undefined
      });
      
      // Iniciar a reprodução
      await TrackPlayer.play();
      
      // Navegar para a tela de player com a música selecionada
      playerNavigation.navigate('Player', { song });
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
    }
  };

  const handlePlayAll = async () => {
    if (album.songs.length === 0) return;
    
    try {
      // Resetar o player
      await TrackPlayer.reset();
      
      // Adicionar todas as músicas do álbum à fila
      const tracks = album.songs.map(song => ({
        id: song.path,
        url: song.path,
        title: song.name,
        artist: song.artist,
        album: song.album,
        artwork: song.cover || undefined
      }));
      
      await TrackPlayer.add(tracks);
      
      // Iniciar a reprodução
      await TrackPlayer.play();
      
      // Navegar para a tela de player com a primeira música
      playerNavigation.navigate('Player', { song: album.songs[0] });
    } catch (error) {
      console.error('Erro ao reproduzir álbum:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {album.cover ? (
          <FastImage 
            source={{ 
              uri: album.cover,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable
            }} 
            style={styles.albumCover}
          />
        ) : (
          <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
            <Text style={styles.albumCoverPlaceholderText}>
              {album.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.albumInfo}>
          <Text style={styles.albumTitle}>{album.name}</Text>
          <Text style={styles.albumArtist}>{album.artist}</Text>
          <Text style={styles.songCount}>{album.songs.length} músicas</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.playAllButton}
        onPress={handlePlayAll}
      >
        <Text style={styles.playAllButtonText}>Reproduzir Todas</Text>
      </TouchableOpacity>

      <SongList 
        songs={album.songs}
        onSelectSong={handlePlaySong}
        style={styles.songsList}
      />

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  playAllButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  playAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  songsList: {
    flex: 1,
  },
  backButton: {
    backgroundColor: '#607D8B',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});