import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song, Playlist } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetails'>;

interface PlaylistState {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  selectedSong: any;
  modalVisible: boolean;
  editMode: boolean;
  playlistName: string;
  message: string;
  playlistSongs: Song[];
  searchQuery: string;
}

const PlaylistsScreen = () => {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const allSongs = useSelector((state: RootState) => state.playlist.songs);

  const [state, setState] = useState<PlaylistState>({
    playlists: [],
    selectedPlaylist: null,
    selectedSong: null,
    modalVisible: false,
    editMode: false,
    playlistName: '',
    message: '',
    playlistSongs: [],
    searchQuery: '',
  });

  // Toast helper
  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      // Implemente um toast para iOS se desejar
      Alert.alert(msg);
    }
  };

  // Atualiza estado parcial
  const updateState = (newState: Partial<PlaylistState>) => {
    setState((prevState: PlaylistState) => ({ ...prevState, ...newState }));
  };

  // Busca/filtro de músicas
  const filteredSongs = state.searchQuery.trim()
    ? allSongs.filter(
        (song) =>
          song.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    : allSongs;

  // Adiciona música à playlist em edição/criação
  const toggleSongInPlaylist = (song: Song) => {
    if (state.playlistSongs.find((s) => s.id === song.id)) {
      updateState({ playlistSongs: state.playlistSongs.filter((s) => s.id !== song.id) });
    } else {
      updateState({ playlistSongs: [...state.playlistSongs, song] });
    }
  };

  // Ordenação de músicas na playlist
  const handleDragEnd = ({ data }: { data: Song[] }) => {
    updateState({ playlistSongs: data });
  };

  // Cria nova playlist
  const createPlaylist = () => {
    if (!state.playlistName.trim()) {
      showToast(t('playlists.nomeObrigatorio'));
      return;
    }
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).slice(2, 11),
      name: state.playlistName,
      songs: state.playlistSongs,
    };
    updateState({
      playlists: [...state.playlists, newPlaylist],
      modalVisible: false,
      playlistName: '',
      playlistSongs: [],
      message: t('playlists.criadaComSucesso'),
    });
    showToast(t('playlists.criadaComSucesso'));
  };

  // Edita playlist existente
  const editPlaylist = () => {
    if (!state.selectedPlaylist) return;
    if (!state.playlistName.trim()) {
      showToast(t('playlists.nomeObrigatorio'));
      return;
    }
    const updatedPlaylists = state.playlists.map((playlist) =>
      playlist.id === state.selectedPlaylist?.id
        ? { ...playlist, name: state.playlistName, songs: state.playlistSongs }
        : playlist
    );
    updateState({
      playlists: updatedPlaylists,
      modalVisible: false,
      editMode: false,
      selectedPlaylist: null,
      playlistName: '',
      playlistSongs: [],
      message: t('playlists.atualizadaComSucesso'),
    });
    showToast(t('playlists.atualizadaComSucesso'));
  };

  // Abre modal para editar playlist
  const openEditModal = (playlist: Playlist) => {
    updateState({
      modalVisible: true,
      editMode: true,
      selectedPlaylist: playlist,
      playlistName: playlist.name,
      playlistSongs: playlist.songs,
      searchQuery: '',
    });
  };

  // Navega para detalhes da playlist (mostra músicas)
  const navigateToPlaylistDetails = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetails', { playlist });
  };

  // Tocar todas as músicas da playlist (chamada real do player)
  const playPlaylist = (playlist: Playlist) => {
    if (!playlist.songs.length) {
      showToast(t('playlists.nenhumaMusicaNaPlaylist'));
      return;
    }
    // Navega para a tela de player, passando a playlist
    navigation.navigate('Player', { song: playlist.songs[0], playlist: playlist.songs });
  };

  // Exportar playlist em M3U (escolher local e nome)
  const exportPlaylistM3U = async (playlist: Playlist) => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: false,
      });
      if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) return;
      
      let fileUri = pickerResult.assets[0].uri;
      if (!fileUri.endsWith('.m3u')) {
        fileUri += '.m3u';
      }

      const m3uContent =
        '#EXTM3U\n' +
        playlist.songs
          .map((song) => `#EXTINF:-1,${song.artist} - ${song.name}\n${song.path}`)
          .join('\n');

      await FileSystem.writeAsStringAsync(fileUri, m3uContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      showToast(t('playlists.salvaM3U', { file: fileUri }));
    } catch (error) {
      showToast(t('playlists.erroSalvarM3U'));
    }
  };

  // Renderização do item da playlist
  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, { backgroundColor: theme.card }]}
      onPress={() => navigateToPlaylistDetails(item)}
      onLongPress={() => openEditModal(item)}>
      <Text style={[styles.playlistName, { color: theme.text }]}>
        {item.name} ({t('playlists.contadorMusicas', { count: item.songs.length })})
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => playPlaylist(item)}>
          <Text style={{ color: 'white' }}>{t('playlists.tocarTudo')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => exportPlaylistM3U(item)}>
          <Text style={{ color: 'white' }}>{t('playlists.exportarM3U')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Renderização do item da música na playlist (drag-and-drop)
  const renderDraggableSongItem = ({ item, drag, isActive }: RenderItemParams<Song>) => (
    <TouchableOpacity
      style={[
        styles.songItem,
        isActive && { backgroundColor: '#c8e6c9' },
        state.playlistSongs.find((s) => s.id === item.id) && styles.songItemSelected,
      ]}
      onLongPress={drag}
      onPress={() => toggleSongInPlaylist(item)}>
      <Text style={{ color: theme.text }}>{item.name}</Text>
      <TouchableOpacity onPress={() => toggleSongInPlaylist(item)}>
        <Text style={{ color: 'red', marginLeft: 4 }}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{t('playlists.titulo')}</Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.primary }]}
        onPress={() =>
          updateState({
            modalVisible: true,
            editMode: false,
            playlistName: '',
            playlistSongs: [],
            selectedPlaylist: null,
            searchQuery: '',
          })
        }>
        <Text style={styles.createButtonText}>{t('playlists.novaPlaylist')}</Text>
      </TouchableOpacity>

      {state.playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('playlists.nenhumaPlaylist')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
        />
      )}

      <Modal visible={state.modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {state.editMode ? t('playlists.editarPlaylist') : t('playlists.criarPlaylist')}
            </Text>
            <TextInput
              placeholder={t('playlists.nomePlaylist')}
              placeholderTextColor={theme.secondaryText}
              value={state.playlistName}
              onChangeText={(text) => updateState({ playlistName: text })}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
            <TextInput
              placeholder={t('playlists.buscaMusicas')}
              placeholderTextColor={theme.secondaryText}
              value={state.searchQuery}
              onChangeText={(text) => updateState({ searchQuery: text })}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
            <Text style={{ color: theme.text, marginBottom: 8 }}>
              {t('playlists.adicionarMusicas')}
            </Text>
            <FlatList
              data={filteredSongs}
              keyExtractor={(item) => item.id}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleSongInPlaylist(item)}
                  style={[
                    styles.songItem,
                    state.playlistSongs.find((s) => s.id === item.id) && styles.songItemSelected,
                  ]}>
                  <Text style={{ color: theme.text }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Text style={{ color: theme.text, marginTop: 8 }}>
              {t('playlists.musicasNaPlaylist')}
            </Text>
            <DraggableFlatList
              data={state.playlistSongs}
              keyExtractor={(item) => item.id}
              horizontal
              renderItem={renderDraggableSongItem}
              onDragEnd={handleDragEnd}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => updateState({ modalVisible: false })}>
                <Text style={styles.buttonText}>{t('comum.cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={state.editMode ? editPlaylist : createPlaylist}>
                <Text style={styles.buttonText}>
                  {state.editMode ? t('comum.salvar') : t('comum.criar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  createButton: { padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
  playlistItem: { padding: 16, borderRadius: 8, marginBottom: 8 },
  playlistName: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: { width: '80%', padding: 20, borderRadius: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 4, padding: 10, marginBottom: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 4, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#ccc' },
  saveButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  songItem: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  songItemSelected: { backgroundColor: '#c8e6c9' },
  actionButton: { padding: 8, borderRadius: 4, marginHorizontal: 4, alignItems: 'center' },
});

export default PlaylistsScreen;
