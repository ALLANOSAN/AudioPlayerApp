import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { SongList } from '../components/SongList';
import { Audio } from 'expo-av';
import { lastFmService } from '../services/lastFmService';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

const SongsScreen = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    return () => {
      // Cleanup function for audio
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
    );

    setFilteredSongs(filtered);
  }, [searchQuery, songs]);

  const addSongsFromFolder = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Seleção de arquivo cancelada.');
        return;
      }

      // Verifica se há pelo menos um arquivo selecionado
      if (!result.assets || result.assets.length === 0) {
        console.error('Falha ao selecionar arquivo.');
        return;
      }

      const asset = result.assets[0];
      const filePath = asset.uri;
      const fileName = asset.name ? asset.name.replace(/\.[^/.]+$/, '') : 'Unknown';

      let title = fileName;
      let artist = 'Artista Desconhecido';
      let cover = '';

      try {
        const songInfo = await lastFmService.fetchSongInfo(fileName);
        title = songInfo.title || fileName;
        artist = songInfo.artist || 'Artista Desconhecido';
        cover = songInfo.cover || '';
      } catch (metadataError) {
        console.error('Erro ao obter metadados:', metadataError);
      }

      const audioFiles: Song[] = [
        {
          id: Date.now().toString(),
          url: filePath,
          title: title,
          artist: artist,
          artwork: cover,
          duration: 0,
        },
      ];

      setSongs((prevSongs) => [...prevSongs, ...audioFiles]);
    } catch (err) {
      console.error('Erro ao selecionar a pasta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const playCurrentSong = async (song: Song) => {
    try {
      // Encontra o índice da música selecionada
      const index = songs.findIndex((s) => s.id === song.id);
      if (index !== -1) {
        setCurrentSongIndex(index);
      }

      // Unload música anterior se existir
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true }
      );

      soundRef.current = newSound;

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Reprodução finalizada.');
          // Aqui você pode implementar a lógica para tocar a próxima música
        }
      });

      // Navega para a tela do player
      navigation.navigate('Player', { song });
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
    }
  };

  const getNextTrack = (): Song | null => {
    if (songs.length === 0) return null;
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
    return songs[nextIndex];
  };

  const getPreviousTrack = (): Song | null => {
    if (songs.length === 0) return null;
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    return songs[prevIndex];
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
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addSongsFromFolder} disabled={isLoading}>
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