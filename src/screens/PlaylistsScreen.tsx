import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, Modal } from 'react-native';
import RNFS from 'react-native-fs';
import * as mm from 'music-metadata';
import { pick, types } from '@react-native-documents/picker';

const PlaylistsScreen = () => {
  const [playlists, setPlaylists] = useState<{ id: string; name: string; songs: any[] }[]>([]);
  const [playlistName, setPlaylistName] = useState(''); 
  const [modalVisible, setModalVisible] = useState(false); 
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null); 
  const [songs, setSongs] = useState<{ name: string; path: string }[]>([]);
  const [selectedSong, setSelectedSong] = useState<any>(null); 
  const [editMode, setEditMode] = useState(false); 
  const [message, setMessage] = useState(''); 

  useEffect(() => {
    const loadSongs = async () => {
      const folderPath = ''; 
      const files = await RNFS.readDir(folderPath);
      const audioFiles = files.filter(file => file.name.endsWith('.mp3'));

      const songsData = await Promise.all(audioFiles.map(async (file) => {
        const metadata = await mm.parseFile(file.path);
        return {
          name: metadata.common.title || file.name.replace('.mp3', ''),
          path: file.path,
        };
      }));

      setSongs(songsData);
    };

    loadSongs();
  }, []);

  const createPlaylist = () => {
    if (playlistName.trim()) {
      setPlaylists([...playlists, { id: Date.now().toString(), name: playlistName, songs: [] }]);
      setPlaylistName('');
      setModalVisible(false);
      setMessage('Playlist criada com sucesso!');
    }
  };

  const editPlaylist = () => {
    if (selectedPlaylist && playlistName.trim()) {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === selectedPlaylist.id) {
          return { ...playlist, name: playlistName };
        }
        return playlist;
      });
      setPlaylists(updatedPlaylists);
      setPlaylistName('');
      setModalVisible(false);
      setEditMode(false);
      setSelectedPlaylist(null);
      setMessage('Playlist editada com sucesso!');
    }
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
    setMessage('Playlist removida com sucesso!');
  };

  const addSongToPlaylist = () => {
    if (selectedPlaylist && selectedSong) {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === selectedPlaylist.id) {
          return { ...playlist, songs: [...playlist.songs, selectedSong] };
        }
        return playlist;
      });
      setPlaylists(updatedPlaylists);
      setSelectedPlaylist(null);
      setSelectedSong(null);
      setMessage('Música adicionada à playlist!');
    }
  };

  const savePlaylistToFile = async (playlist: { songs: { name: string; path: string }[] }) => {
    try {
        const [path] = await pick({
            type: [types.allFiles],
        });
        const filePath = path.uri; // Obtém o caminho do arquivo escolhido

        const content = `#EXTM3U\n${playlist.songs.map(song => `#EXTINF:-1,${song.name}\n${song.path}`).join('\n')}`;

        await RNFS.writeFile(filePath, content, 'utf8');
        setMessage('Playlist salva com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar a playlist:', error);
        setMessage('Erro ao salvar a playlist. Tente novamente.');
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Playlists</Text>
      <Button title="Criar Playlist" onPress={() => {
        setEditMode(false);
        setModalVisible(true);
      }} />

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistItem}>
            <Text>{item.name}</Text>
            <Button title="Adicionar Música" onPress={() => {
              setSelectedPlaylist(item);
              setModalVisible(true);
            }} />
            <Button title="Editar" onPress={() => {
              setPlaylistName(item.name);
              setSelectedPlaylist(item);
              setEditMode(true);
              setModalVisible(true);
            }} />
            <Button title="Remover" onPress={() => deletePlaylist(item.id)} />
            <Button title="Salvar Playlist" onPress={() => savePlaylistToFile(item)} />
          </View>
        )}
      />

      {/* Modal para criar ou editar playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Nome da playlist"
            value={playlistName}
            onChangeText={setPlaylistName}
          />
          <Button title={editMode ? 'Salvar Alterações' : 'Criar Playlist'} onPress={editMode ? editPlaylist : createPlaylist} />
          <Button title="Fechar" onPress={() => {
            setModalVisible(false);
            setSelectedPlaylist(null);
            setEditMode(false);
          }} />
        </View>
      </Modal>

      {/* Modal para adicionar músicas à playlist */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedPlaylist !== null}
        onRequestClose={() => setSelectedPlaylist(null)}
      >
        <View style={styles.modalView}>
          <Text style={styles.title}>Adicionar Música à {selectedPlaylist?.name}</Text>
          <FlatList
            data={songs}
            keyExtractor={(item) => item.path}
            renderItem={({ item }) => (
              <View style={styles.songItem}>
                <Text>{item.name}</Text>
                <Button title="Adicionar" onPress={() => {
                  setSelectedSong(item);
                  addSongToPlaylist();
                }} />
              </View>
            )}
          />
          <Button title="Fechar" onPress={() => setSelectedPlaylist(null)} />
        </View>
      </Modal>

      {/* Mensagem de feedback */}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  playlistItem: {
    // Add your styles here
  },
  modalView: {
    // Add your styles here
  },
  songItem: {
    // Add your styles here
  },
  message: {
    // Add your styles here
  },
});

export default PlaylistsScreen;