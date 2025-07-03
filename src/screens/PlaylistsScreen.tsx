import React, { useState, useEffect, useReducer } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Platform,
  ToastAndroid,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux'; // Se estiver usando Redux para buscar todas as músicas
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import RNFS from 'react-native-fs'; // Alterado
// DocumentPicker é para abrir, não para salvar em local escolhido facilmente sem Expo.
// import DocumentPicker, { types } from 'react-native-document-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react';
import { Song, Playlist } from '../types/music';
import { RootStackParamList } from '../types/navigation';
import { RootState } from '../store'; // Ajuste o caminho se necessário
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AudioPlayer } from '../services/AudioPlayer';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetails' | 'Player'>;

interface PlaylistState {
  playlists: Playlist[];
  selectedPlaylist: Playlist | null;
  modalVisible: boolean;
  editMode: boolean;
  playlistName: string;
  playlistSongs: Song[]; // Músicas atualmente sendo adicionadas/editadas na playlist
  searchQuery: string; // Para buscar músicas para adicionar à playlist
  allAvailableSongs: Song[]; // Todas as músicas disponíveis no app
}

const initialState: PlaylistState = {
  playlists: [],
  selectedPlaylist: null,
  modalVisible: false,
  editMode: false,
  playlistName: '',
  playlistSongs: [],
  searchQuery: '',
  allAvailableSongs: [],
};

function playlistReducer(state: PlaylistState, action: any): PlaylistState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'DELETE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter((p) => p.id !== action.payload),
      };
    case 'SET_ALL_AVAILABLE_SONGS':
      return { ...state, allAvailableSongs: action.payload };
    default:
      return state;
  }
}

const PlaylistsScreen = () => {
  const { t } = useTranslate();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  // Exemplo: Buscando todas as músicas do estado global do Redux.
  // Se você não usa Redux, precisará de outra forma de obter todas as músicas.
  const allSongsFromStore = useSelector((globalState: RootState) => globalState.playlist.songs); // Ajuste conforme sua estrutura Redux
  const player = AudioPlayer.getInstance();

  const [state, dispatch] = useReducer(playlistReducer, initialState);

  useEffect(() => {
    // Carregar playlists salvas (ex: AsyncStorage)
    // loadPlaylists();
    dispatch({ type: 'SET_ALL_AVAILABLE_SONGS', payload: allSongsFromStore });
  }, [allSongsFromStore]);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const filteredSongsForModal = state.searchQuery.trim()
    ? state.allAvailableSongs.filter(
        (song) =>
          song.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          (song.artist && song.artist.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    : state.allAvailableSongs;

  const toggleSongInStagingPlaylist = (song: Song) => {
    const isSelected = state.playlistSongs.find((s) => s.id === song.id);
    if (isSelected) {
      dispatch({
        type: 'SET_STATE',
        payload: { playlistSongs: state.playlistSongs.filter((s) => s.id !== song.id) },
      });
    } else {
      dispatch({
        type: 'SET_STATE',
        payload: { playlistSongs: [...state.playlistSongs, song] },
      });
    }
  };

  const handleDragEndModal = ({ data }: { data: Song[] }) => {
    dispatch({ type: 'SET_STATE', payload: { playlistSongs: data } });
  };

  const handleCreateOrUpdatePlaylist = () => {
    if (!state.playlistName.trim()) {
      showToast(t('playlists.nomeObrigatorio'));
      return;
    }

    if (state.editMode && state.selectedPlaylist) {
      const updatedPlaylist: Playlist = {
        ...state.selectedPlaylist,
        name: state.playlistName,
        songs: state.playlistSongs,
      };
      dispatch({ type: 'UPDATE_PLAYLIST', payload: updatedPlaylist });
      showToast(t('playlists.atualizadaComSucesso'));
    } else {
      const newPlaylist: Playlist = {
        id: Date.now().toString(), // ID simples
        name: state.playlistName,
        songs: state.playlistSongs,
      };
      dispatch({ type: 'ADD_PLAYLIST', payload: newPlaylist });
      showToast(t('playlists.criadaComSucesso'));
    }
    // savePlaylistsToStorage(state.playlists); // Salvar no AsyncStorage
    dispatch({
      type: 'SET_STATE',
      payload: {
        modalVisible: false,
        editMode: false,
        playlistName: '',
        playlistSongs: [],
        selectedPlaylist: null,
        searchQuery: '',
      },
    });
  };

  const openModalForCreate = () => {
    dispatch({
      type: 'SET_STATE',
      payload: {
        modalVisible: true,
        editMode: false,
        playlistName: '',
        playlistSongs: [],
        selectedPlaylist: null,
        searchQuery: '',
      },
    });
  };

  const openModalForEdit = (playlist: Playlist) => {
    dispatch({
      type: 'SET_STATE',
      payload: {
        modalVisible: true,
        editMode: true,
        selectedPlaylist: playlist,
        playlistName: playlist.name,
        playlistSongs: [...playlist.songs], // Copia para não modificar o original diretamente
        searchQuery: '',
      },
    });
  };

  const confirmDeletePlaylist = (playlistId: string) => {
    Alert.alert(t('playlists.excluirPlaylist'), t('playlists.confirmaExcluirPlaylist'), [
      { text: t('comum.cancelar'), style: 'cancel' },
      {
        text: t('comum.excluir'),
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_PLAYLIST', payload: playlistId });
          // savePlaylistsToStorage(state.playlists.filter(p => p.id !== playlistId));
          showToast(t('playlists.excluidaComSucesso'));
        },
      },
    ]);
  };

  const playPlaylist = (playlist: Playlist) => {
    if (!playlist.songs || playlist.songs.length === 0) {
      showToast(t('playlists.nenhumaMusicaNaPlaylist'));
      return;
    }
    navigation.navigate('Player', {
      song: playlist.songs[0],
      playlist: playlist.songs,
      songIndex: 0, // Adicione esta linha
    });
  };

  const exportPlaylistM3U = async (playlist: Playlist) => {
    try {
      const playlistNameSanitized = playlist.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${playlistNameSanitized || 'playlist'}.m3u`;
      // Salva no diretório de documentos do app. O usuário precisará de um explorador de arquivos para acessar.
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const m3uContent =
        '#EXTM3U\n' +
        playlist.songs
          .map(
            (song) => `#EXTINF:${song.duration || -1},${song.artist} - ${song.name}\n${song.path}`
          )
          .join('\n');

      await RNFS.writeFile(path, m3uContent, 'utf8');
      showToast(t('playlists.salvaM3U', { file: path }));
      Alert.alert(t('playlists.exportada'), t('playlists.salvaEmDocumentos', { path }));
    } catch (error) {
      console.error('Erro ao salvar M3U:', error);
      showToast(t('playlists.erroSalvarM3U'));
      Alert.alert(t('erro.titulo'), t('playlists.erroSalvarM3U'));
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItemContainer, { backgroundColor: theme.card }]}
      onPress={() => openModalForEdit(item)} // Ou navegar para detalhes
      // onLongPress={() => openModalForEdit(item)} // Pode ser redundante se o onPress já edita
    >
      <View style={styles.playlistInfo}>
        <MaterialIcons
          name="playlist-play"
          size={24}
          color={theme.primary}
          style={styles.playlistIcon}
        />
        <View>
          <Text style={[styles.playlistName, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.playlistSongCount, { color: theme.secondaryText }]}>
            {t('playlists.contadorMusicas', { count: item.songs.length })}
          </Text>
        </View>
      </View>
      <View style={styles.playlistActions}>
        <TouchableOpacity onPress={() => playPlaylist(item)} style={styles.actionIcon}>
          <MaterialIcons name="play-circle-outline" size={28} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => exportPlaylistM3U(item)} style={styles.actionIcon}>
          <MaterialIcons name="save-alt" size={26} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDeletePlaylist(item.id)} style={styles.actionIcon}>
          <MaterialIcons name="delete-outline" size={26} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSongItemForModal = ({ item, drag, isActive }: RenderItemParams<Song>) => {
    const isSelected = state.playlistSongs.find((s) => s.id === item.id);
    return (
      <TouchableOpacity
        style={[
          styles.modalSongItem,
          { backgroundColor: theme.cardItem || (isDark ? '#424242' : '#f0f0f0') },
          isActive && { backgroundColor: theme.primary + '40' },
          isSelected && { backgroundColor: theme.primary + '70' },
        ]}
        onPress={() => toggleSongInStagingPlaylist(item)}
        onLongPress={drag} // Habilita arrastar
      >
        <Text style={[styles.modalSongName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.modalSongArtist, { color: theme.secondaryText }]} numberOfLines={1}>
          {item.artist}
        </Text>
        {isSelected && (
          <MaterialIcons
            name="check-circle"
            size={20}
            color={theme.primary}
            style={{ marginLeft: 'auto' }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{t('playlists.titulo')}</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={openModalForCreate}>
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>{t('playlists.novaPlaylist')}</Text>
        </TouchableOpacity>
      </View>

      {state.playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="queue-music" size={64} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('playlists.nenhumaPlaylist')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={state.playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={state.modalVisible}
        onRequestClose={() => dispatch({ type: 'SET_STATE', payload: { modalVisible: false } })}>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.background || theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {state.editMode ? t('playlists.editarPlaylist') : t('playlists.novaPlaylist')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder={t('playlists.nomePlaylist')}
              placeholderTextColor={theme.secondaryText}
              value={state.playlistName}
              onChangeText={(text) =>
                dispatch({ type: 'SET_STATE', payload: { playlistName: text } })
              }
            />

            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
              {t('playlists.adicionarMusicas')}:
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.searchInputModal,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder={t('busca.placeholder')}
              placeholderTextColor={theme.secondaryText}
              value={state.searchQuery}
              onChangeText={(text) =>
                dispatch({ type: 'SET_STATE', payload: { searchQuery: text } })
              }
            />
            <View style={styles.songListModalContainer}>
              <DraggableFlatList
                data={filteredSongsForModal} // Músicas filtradas disponíveis para adicionar
                keyExtractor={(item) => `available-${item.id}`}
                renderItem={renderSongItemForModal} // Reutiliza ou cria um novo render item
                onDragEnd={({ data }) => {
                  /* Não faz nada ao arrastar aqui, apenas seleciona */
                }}
                // Não precisa de onDragEnd se for apenas para seleção
                // Se quiser reordenar a lista de disponíveis (geralmente não necessário)
                // onDragEnd={({ data }) => dispatch({ type: 'SET_ALL_AVAILABLE_SONGS', payload: data })}
              />
            </View>

            <Text
              style={[styles.modalSectionTitle, { color: theme.text, marginTop: 10 }]}
              numberOfLines={1}>
              {t('playlists.musicasNaPlaylist')} ({state.playlistSongs.length}):
            </Text>
            <View style={styles.songListModalContainer}>
              <DraggableFlatList
                data={state.playlistSongs} // Músicas já na playlist (para reordenar)
                keyExtractor={(item) => `selected-${item.id}`}
                renderItem={renderSongItemForModal} // Reutiliza ou cria um novo render item
                onDragEnd={handleDragEndModal} // Para reordenar as músicas na playlist
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.secondary || '#ccc' }]}
                onPress={() => dispatch({ type: 'SET_STATE', payload: { modalVisible: false } })}>
                <Text
                  style={[styles.modalButtonText, { color: theme.text }]}>
                  {t('comum.cancelar')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateOrUpdatePlaylist}>
                <Text style={styles.modalButtonText}>
                  {state.editMode ? t('comum.salvar') : t('comum.criar')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginBottom: 16,
  },
  createButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 5 },
  playlistItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistIcon: {
    marginRight: 12,
  },
  playlistName: { fontSize: 18, fontWeight: '500' },
  playlistSongCount: { fontSize: 14 },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 6,
    marginLeft: 8,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%', // Limita a altura do modal
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  searchInputModal: {
    marginBottom: 10,
  },
  modalSectionTitle: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  songListModalContainer: {
    height: 150, // Altura fixa para as listas de músicas no modal
    borderWidth: 1,
    borderRadius: 8,
    // borderColor: theme.border, // Definido inline
    marginBottom: 15,
  },
  modalSongItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    // borderBottomColor: theme.borderLight, // Definido inline
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSongName: { fontSize: 15 },
  modalSongArtist: { fontSize: 13, marginTop: 2 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});

export default PlaylistsScreen;
