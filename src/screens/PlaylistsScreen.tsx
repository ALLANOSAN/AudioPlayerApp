import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system'; // Alterado para expo-file-system
import { pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song } from '../types/song';
import { Playlist, PlaylistState } from '../types/playlist';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetails'>;

const PlaylistsScreen = () => {
  // Estado inicial usando a interface PlaylistState
  const [state, setState] = useState<PlaylistState>({
    playlists: [],
    selectedPlaylist: null,
    selectedSong: null,
    modalVisible: false,
    editMode: false,
    playlistName: '',
    message: ''
  });

  const [songs, setSongs] = useState<Song[]>([]);
  const navigation = useNavigation<NavigationProp>();

  // Função auxiliar para atualizar apenas parte do estado
  const updateState = (newState: Partial<PlaylistState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  // Limpar mensagem após alguns segundos
  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => {
        updateState({ message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.message]);

  // Carregar músicas
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const folderPath = ''; // Defina o caminho da pasta escolhida
        const files = await FileSystem.readDirectoryAsync(folderPath); // Alterado para usar expo-file-system
        const audioFiles = files.filter(file => file.endsWith('.mp3')); // Atualizado para verificar extensões

        const songsData = audioFiles.map((file) => {
          // Extrair nome do arquivo sem a extensão
          const fileName = file.replace('.mp3', '');
          
          return {
            path: `${folderPath}/${file}`, // Atualizado para incluir o caminho completo
            name: fileName,
            artist: 'Desconhecido',
            cover: '',
            album: 'Desconhecido'
          };
        });

        setSongs(songsData);
      } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        updateState({ message: 'Erro ao carregar músicas' });
      }
    };

    loadSongs();
  }, []);

  // Criar nova playlist
  const createPlaylist = () => {
    if (state.playlistName.trim()) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: state.playlistName,
        songs: []
      };
      
      updateState({
        playlists: [...state.playlists, newPlaylist],
        playlistName: '',
        modalVisible: false,
        message: 'Playlist criada com sucesso!'
      });
    } else {
      updateState({ message: 'Digite um nome para a playlist' });
    }
  };

  // Editar playlist existente
  const editPlaylist = () => {
    if (state.selectedPlaylist && state.playlistName.trim()) {
      const updatedPlaylists = state.playlists.map(playlist => {
        if (playlist.id === state.selectedPlaylist?.id) {
          return { ...playlist, name: state.playlistName };
        }
        return playlist;
      });
      
      updateState({
        playlists: updatedPlaylists,
        playlistName: '',
        modalVisible: false,
        editMode: false,
        selectedPlaylist: null,
        message: 'Playlist editada com sucesso!'
      });
    }
  };

  // Excluir playlist
  const deletePlaylist = (id: string) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta playlist?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            updateState({
              playlists: state.playlists.filter(playlist => playlist.id !== id),
              message: 'Playlist removida com sucesso!'
            });
          }
        }
      ]
    );
  };

  // Adicionar música à playlist
  const addSongToPlaylist = (song: Song) => {
    if (state.selectedPlaylist) {
      const updatedPlaylists = state.playlists.map(playlist => {
        if (playlist.id === state.selectedPlaylist?.id) {
          // Verificar se a música já existe na playlist
          const songExists = playlist.songs.some(s => s.path === song.path);
          if (songExists) {
            updateState({ message: 'Esta música já está na playlist' });
            return playlist;
          }
          return { ...playlist, songs: [...playlist.songs, song] };
        }
        return playlist;
      });
      
      updateState({
        playlists: updatedPlaylists,
        message: 'Música adicionada à playlist!'
      });
    }
  };

  // Remover música da playlist
  const removeSongFromPlaylist = (playlistId: string, songPath: string) => {
    const updatedPlaylists = state.playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(song => song.path !== songPath)
        };
      }
      return playlist;
    });
    
    updateState({
      playlists: updatedPlaylists,
      message: 'Música removida da playlist!'
    });
  };

  // Salvar playlist como arquivo M3U
  const savePlaylistToFile = async (playlist: Playlist) => {
    try {
      const [path] = await pick({
        type: [types.allFiles],
      });
      const filePath = path.uri;

      const content = `#EXTM3U\n${playlist.songs.map(song => 
        `#EXTINF:-1,${song.artist} - ${song.name}\n${song.path}`).join('\n')}`;

      await FileSystem.writeAsStringAsync(filePath, content, { encoding: FileSystem.EncodingType.UTF8 }); // Alterado para usar expo-file-system
      updateState({ message: 'Playlist salva com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar a playlist:', error);
      updateState({ message: 'Erro ao salvar a playlist. Tente novamente.' });
    }
  };

  // Navegar para detalhes da playlist
  const navigateToPlaylistDetails = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetails', { playlist });
  };

  // Renderizar item da playlist
  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <View style={styles.playlistItem}>
      <TouchableOpacity 
        style={styles.playlistHeader}
        onPress={() => navigateToPlaylistDetails(item)}
      >
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songs.length} músicas</Text>
      </TouchableOpacity>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => updateState({ selectedPlaylist: item })}
        >
          <Text style={styles.buttonText}>Adicionar Música</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            updateState({
              playlistName: item.name,
              selectedPlaylist: item,
              editMode: true,
              modalVisible: true
            });
          }}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.deleteButton]}
          onPress={() => deletePlaylist(item.id)}
        >
          <Text style={styles.buttonText}>Remover</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => savePlaylistToFile(item)}
        >
          <Text style={styles.buttonText}>Exportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Playlists</Text>
      
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => updateState({ editMode: false, modalVisible: true })}
      >
        <Text style={styles.createButtonText}>Criar Nova Playlist</Text>
      </TouchableOpacity>

      {state.playlists.length > 0 ? (
        <FlatList
          data={state.playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Você ainda não tem playlists. Crie uma nova playlist para começar!
          </Text>
        </View>
      )}

      {/* Modal para criar ou editar playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={state.modalVisible}
        onRequestClose={() => updateState({ modalVisible: false })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {state.editMode ? 'Editar Playlist' : 'Criar Nova Playlist'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome da playlist"
              value={state.playlistName}
              onChangeText={(text) => updateState({ playlistName: text })}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => updateState({
                  modalVisible: false,
                  selectedPlaylist: null,
                  editMode: false,
                  playlistName: ''
                })}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={state.editMode ? editPlaylist : createPlaylist}
              >
                <Text style={styles.buttonText}>
                  {state.editMode ? 'Salvar' : 'Criar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para adicionar músicas à playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={state.selectedPlaylist !== null && !state.modalVisible}
        onRequestClose={() => updateState({ selectedPlaylist: null })}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Adicionar Música à {state.selectedPlaylist?.name}
            </Text>
            
            {songs.length > 0 ? (
              <FlatList
                data={songs}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => (
                  <View style={styles.songItem}>
                    <Text style={styles.songName}>{item.name}</Text>
                    <Text style={styles.artistName}>{item.artist}</Text>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => addSongToPlaylist(item)}
                    >
                      <Text style={styles.buttonText}>Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                )}
                style={styles.songList}
              />
            ) : (
              <Text style={styles.emptyStateText}>
                Nenhuma música encontrada. Adicione músicas ao seu dispositivo.
              </Text>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.closeButton]}
              onPress={() => updateState({ selectedPlaylist: null })}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mensagem de feedback */}
      {state.message ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{state.message}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  playlistItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  songCount: {
    fontSize: 14,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  closeButton: {
    backgroundColor: '#607D8B',
    alignSelf: 'center',
    paddingHorizontal: 30,
    marginTop: 15,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  songName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 2,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  songList: {
    maxHeight: 300,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PlaylistsScreen;