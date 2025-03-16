import React, { useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Song } from '../types/song';
import { Playlist, PlaylistState } from '../types/playlist';
import { RootStackParamList } from '../types/navigation';

// Tipagem de navegação
type NavigationProp = StackNavigationProp<RootStackParamList, 'PlaylistDetails'>;

const PlaylistsScreen = () => {
  const [state, setState] = useState<PlaylistState>({
    playlists: [],
    selectedPlaylist: null,
    selectedSong: null,
    modalVisible: false,
    editMode: false,
    playlistName: '',
    message: ''
  });
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const navigation = useNavigation<NavigationProp>();

  const updateState = (newState: Partial<PlaylistState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

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
        modalVisible: false
      });
    }
  };

  // Editar nome da playlist
  const editPlaylist = () => {
    if (state.selectedPlaylist && state.playlistName.trim()) {
      const updatedPlaylists = state.playlists.map(playlist => 
        playlist.id === state.selectedPlaylist?.id ? { ...playlist, name: state.playlistName } : playlist
      );
      updateState({ playlists: updatedPlaylists, modalVisible: false, editMode: false, selectedPlaylist: null });
    }
  };

  // Excluir playlist sem excluir músicas
  const deletePlaylist = (id: string) => {
    Alert.alert('Confirmar exclusão', 'Deseja excluir esta playlist?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => updateState({ playlists: state.playlists.filter(p => p.id !== id) }) }
    ]);
  };

  // Adicionar músicas à playlist
  const addSongsToPlaylist = (songs: Song[]) => {
    if (state.selectedPlaylist) {
      const updatedPlaylists = state.playlists.map(playlist => 
        playlist.id === state.selectedPlaylist?.id ? { ...playlist, songs: [...playlist.songs, ...songs] } : playlist
      );
      updateState({ playlists: updatedPlaylists });
    }
  };

  // Remover música da playlist
  const removeSongFromPlaylist = (playlistId: string, songPath: string) => {
    const updatedPlaylists = state.playlists.map(playlist => 
      playlist.id === playlistId ? { ...playlist, songs: playlist.songs.filter(song => song.path !== songPath) } : playlist
    );
    updateState({ playlists: updatedPlaylists });
  };

  // Navegar para detalhes da playlist
  const navigateToPlaylistDetails = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetails', { playlist });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Playlists</Text>
      <TouchableOpacity style={styles.createButton} onPress={() => updateState({ modalVisible: true })}>
        <Text style={styles.createButtonText}>Criar Nova Playlist</Text>
      </TouchableOpacity>
      <FlatList
        data={state.playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToPlaylistDetails(item)}>
            <Text style={styles.playlistName}>{item.name} ({item.songs.length} músicas)</Text>
          </TouchableOpacity>
        )}
      />
      <Modal visible={state.modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TextInput placeholder="Nome da playlist" value={state.playlistName} onChangeText={(text) => updateState({ playlistName: text })} />
          <Button title={state.editMode ? "Salvar" : "Criar"} onPress={state.editMode ? editPlaylist : createPlaylist} />
          <Button title="Cancelar" onPress={() => updateState({ modalVisible: false })} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  createButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 5, alignItems: 'center' },
  createButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  playlistName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }
});

export default PlaylistsScreen;
