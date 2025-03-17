import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song } from '../types/song';
import { RootStackParamList } from '../types/navigation';
import { SongList } from '../components/SongList';
import { Audio } from 'expo-av';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

let currentSongIndex = 0; // Índice da música atual
const songsGlobal: Song[] = []; // Lista de músicas para controle global
let sound: Audio.Sound | null = null; // Controle de som global

const SongsScreen = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(song =>
      song.name.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    );

    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  const addSongsFromFolder = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });

      if (result.canceled) {
        console.log('Seleção de arquivo cancelada.');
        return;
      }

      const file = result.assets[0];

      if (!file) {
        console.error('Nenhum arquivo foi selecionado.');
        return;
      }

      const filePath = file.uri;
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      let title = fileName;
      let artist = 'Artista Desconhecido';
      let album = 'Álbum Desconhecido';
      let cover = '';

      try {
        const songInfo = await fetchSongInfo(fileName);
        title = songInfo.title || fileName;
        artist = songInfo.artist || 'Artista Desconhecido';
        album = songInfo.album || 'Álbum Desconhecido';
        cover = songInfo.cover || '';
      } catch (metadataError) {
        console.error('Erro ao obter metadados:', metadataError);
      }

      const audioFiles: Song[] = [{
        path: filePath,
        name: title,
        artist: artist,
        cover: cover,
        album: album,
      }];

      songsGlobal.push(...audioFiles); // Adiciona globalmente
      setSongs(prevSongs => [...prevSongs, ...audioFiles]);
      setFilteredSongs(prevSongs => [...prevSongs, ...audioFiles]);
    } catch (err) {
      console.error('Erro ao selecionar a pasta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSongInfo = async (songName: string): Promise<{ title: string, artist: string, album: string, cover: string }> => {
    const apiKey = 'c0bc9642cd67227a10ce0a129981513b';
    try {
      const trackResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${songName}&api_key=${apiKey}&format=json`);
      const tracks = trackResponse.data.results?.trackmatches?.track || [];

      if (tracks.length === 0) {
        return { title: songName, artist: 'Artista Desconhecido', album: 'Álbum Desconhecido', cover: '' };
      }

      const track = tracks[0];
      const artist = track.artist;

      const albumResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&api_key=${apiKey}&artist=${artist}&format=json`);
      const albums = albumResponse.data.topalbums?.album || [];
      const cover = albums.length > 0 ? albums[0].image[3]['#text'] : '';

      return {
        title: track.name || songName,
        artist: artist || 'Artista Desconhecido',
        album: albums.length > 0 ? albums[0].name : 'Álbum Desconhecido',
        cover: cover
      };
    } catch (error) {
      console.error('Erro ao buscar informações da música:', error);
      return { title: songName, artist: 'Artista Desconhecido', album: 'Álbum Desconhecido', cover: '' };
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar músicas, artistas ou álbuns..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearSearch}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={addSongsFromFolder}
        disabled={isLoading}
      >
        <Text style={styles.addButtonText}>
          {isLoading ? 'Carregando...' : 'Adicionar Músicas'}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando músicas...</Text>
        </View>
      ) : (
        <SongList songs={filteredSongs} onSelectSong={(song) => playCurrentSong(song)} />
      )}
    </SafeAreaView>
  );
};

export const getCurrentTrack = (direction?: 'next' | 'previous'): Song | null => {
  if (direction === 'next') {
    currentSongIndex = (currentSongIndex + 1) % songsGlobal.length;
  } else if (direction === 'previous') {
    currentSongIndex =
      (currentSongIndex - 1 + songsGlobal.length) % songsGlobal.length;
  }
  return songsGlobal[currentSongIndex] || null;
};

export const playCurrentSong = async (song: Song) => {
  try {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: song.path },
      { shouldPlay: true }
    );

    sound = newSound;

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        console.log('Reprodução finalizada.');
      }
    });
  } catch (error) {
    console.error('Erro ao reproduzir música:', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default SongsScreen;