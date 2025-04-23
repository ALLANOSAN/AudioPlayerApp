import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { Audio } from 'expo-av';
import { lastFmService } from '../services/lastFmService';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

const SongsScreen = () => {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtrar músicas com base na pesquisa
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(
        (song) =>
          song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, songs]);

  // Função para adicionar músicas
  const addSongsFromFolder = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const newSongs: Song[] = [];

      for (const file of result.assets) {
        // Extrair nome do arquivo da URL
        const filenameParts = file.uri.split('/');
        const filename = filenameParts[filenameParts.length - 1];
        const title = filename.replace(/\.[^/.]+$/, ''); // Remove a extensão

        // Tenta obter informações adicionais da música via Last.fm API
        try {
          const songInfo = await lastFmService.fetchSongInfo(title);

          newSongs.push({
            id: Math.random().toString(36).substring(7),
            path: file.uri,
            name: songInfo.title || title,
            artist: songInfo.artist || t('musicas.artistaDesconhecido'),
            artwork: songInfo.cover || '',
            duration: 0,
          });
        } catch (error) {
          // Fallback com informações básicas
          newSongs.push({
            id: Math.random().toString(36).substring(7),
            path: file.uri,
            name: title,
            artist: t('musicas.artistaDesconhecido'),            
            artwork: '',
            duration: 0,
          });
        }
      }

      setSongs((prevSongs) => [...prevSongs, ...newSongs]);
    } catch (error) {
      console.error('Erro ao adicionar músicas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tocar uma música
  const playCurrentSong = async (song: Song) => {
    try {
      // Encontrar o índice da música selecionada
      const index = songs.findIndex((s) => s.id === song.id);
      setCurrentSongIndex(index);

      // Parar qualquer reprodução atual
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      // Redirecionar para a tela de reprodução
      navigation.navigate('Player', { song, playlist: songs });
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
    }
  };

  // Limpar a pesquisa
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Excluir uma música
  const confirmDeleteSong = (songId: string) => {
    Alert.alert(t('musicas.excluir'), t('musicas.confirmaExcluir'), [
      { text: t('comum.cancelar'), style: 'cancel' },
      {
        text: t('comum.excluir'),
        style: 'destructive',
        onPress: () => setSongs(songs.filter((s) => s.id !== songId)),
      },
    ]);
  };

  // Ativar seleção múltipla
  const activateSelectionMode = (songId: string) => {
    setSelectionMode(true);
    setSelectedIds([songId]);
  };

  // Selecionar/desselecionar música
  const toggleSelectSong = (songId: string) => {
    setSelectedIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  // Excluir músicas selecionadas
  const confirmDeleteSelected = () => {
    Alert.alert(t('musicas.excluir'), t('musicas.confirmaExcluirMultiplas'), [
      { text: t('comum.cancelar'), style: 'cancel' },
      {
        text: t('comum.excluir'),
        style: 'destructive',
        onPress: () => {
          setSongs(songs.filter((s) => !selectedIds.includes(s.id)));
          setSelectionMode(false);
          setSelectedIds([]);
        },
      },
    ]);
  };

  // Renderização do item da música
  const renderSongItem = ({ item }: { item: Song }) => {
    if (selectionMode) {
      return (
        <TouchableOpacity
          style={[styles.songItem, selectedIds.includes(item.id) && styles.songItemSelected]}
          onPress={() => toggleSelectSong(item.id)}>
          <Text style={{ color: theme.text }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }
    return (
      
        <GestureHandlerRootView>
          <ReanimatedSwipeable
            friction={2}
            leftThreshold={30}
            renderLeftActions={() => (
              <TouchableOpacity
                style={[styles.swipeAction, { backgroundColor: 'red' }]}
                onPress={() => confirmDeleteSong(item.id)}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('comum.excluir')}</Text>
              </TouchableOpacity>
            )}
            renderRightActions={() => (
              <TouchableOpacity
                style={[styles.swipeAction, { backgroundColor: '#2196F3' }]}
                onPress={() => activateSelectionMode(item.id)}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('comum.selecionar')}</Text>
              </TouchableOpacity>
            )}>
            <TouchableOpacity style={styles.songItem} onPress={() => playCurrentSong(item)}>
              <Text style={{ color: theme.text }}>{item.name}</Text>
            </TouchableOpacity>
          </ReanimatedSwipeable>
        </GestureHandlerRootView>
      );
  };

  // Botão "Tocar tudo"
  const playAllSongs = () => {
    if (songs.length > 0) {
      navigation.navigate('Player', { song: songs[0], playlist: songs });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('busca.placeholder')}
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={addSongsFromFolder}
        disabled={isLoading}>
        <Text style={styles.addButtonText}>
          {isLoading ? t('comum.carregando') : t('musicas.adicionarMusicas')}
        </Text>
      </TouchableOpacity>

      {songs.length > 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.secondary }]}
          onPress={playAllSongs}>
          <Text style={styles.addButtonText}>{t('musicas.tocarTudo')}</Text>
        </TouchableOpacity>
      )}

      {selectionMode && (
        <View style={{ flexDirection: 'row', margin: 10 }}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: 'red', flex: 1 }]}
            onPress={confirmDeleteSelected}
            disabled={selectedIds.length === 0}>
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {t('musicas.excluirSelecionadas')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#ccc', flex: 1 }]}
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds([]);
            }}>
            <Text style={{ color: 'black', textAlign: 'center' }}>{t('comum.cancelar')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>{t('musicas.carregando')}</Text>
        </View>
      ) : filteredSongs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {searchQuery.trim() !== '' ? t('musicas.nenhumResultado') : t('musicas.nenhumaMusica')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 50,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  songItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  songItemSelected: {
    backgroundColor: '#c8e6c9',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
  },
});

export default SongsScreen;
