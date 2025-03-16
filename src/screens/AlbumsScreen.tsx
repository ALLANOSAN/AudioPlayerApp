import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Song } from '../types/song';

const ArtistsScreen = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<Song[]>([]);
  const [tabIndex, setTabIndex] = useState(0); // Gerencia a aba selecionada
  const [routes] = useState([
    { key: 'songs', title: 'Músicas' },
    { key: 'albums', title: 'Álbuns' },
  ]);

  useEffect(() => {
    const loadQueue = async () => {
      const queue = await TrackPlayer.getQueue(); // Obtém músicas do player
      organizeByArtist(queue);
    };

    loadQueue();
  }, []);

  // Converte Song para o formato esperado pelo TrackPlayer
  const mapSongToTrack = (song: Song) => ({
    id: song.path, // Usa o caminho como ID único
    url: song.path, // Caminho para o arquivo
    title: song.name, // Nome da música
    artist: song.artist, // Artista
    album: song.album, // Álbum
    artwork: song.cover, // Capa
  });

  const organizeByArtist = (songs: any[]) => {
    const artistMap: { [key: string]: any } = {};

    songs.forEach((song) => {
      const artist = song.artist || 'Desconhecido';
      const album = song.album || 'Sem Álbum';

      if (!artistMap[artist]) {
        artistMap[artist] = { name: artist, albums: {} };
      }

      if (!artistMap[artist].albums[album]) {
        artistMap[artist].albums[album] = [];
      }

      artistMap[artist].albums[album].push(song);
    });

    const artistList = Object.keys(artistMap).map((artist) => ({
      name: artist,
      albums: Object.keys(artistMap[artist].albums).map((album) => ({
        name: album,
        songs: artistMap[artist].albums[album],
      })),
    }));

    setArtists(artistList);
  };

  const navigateToArtistDetails = (artist: any) => {
    setSelectedArtist(artist);
    setModalVisible(true);
  };

  const playAllSongs = async (songs: Song[], startIndex: number = 0) => {
    try {
      // Converte o array de músicas para o formato TrackPlayer
      const tracks = songs.map(mapSongToTrack);
  
      await TrackPlayer.reset(); // Limpa a fila atual
      await TrackPlayer.add(tracks); // Adiciona todas as músicas à fila
      await TrackPlayer.skip(startIndex); // Usa o índice para pular para a música clicada
      await TrackPlayer.play(); // Começa a reprodução
    } catch (error) {
      console.error('Erro ao reproduzir músicas:', error);
    }
  };

  const showAlbumSongs = (albumSongs: Song[]) => {
    setSelectedAlbumSongs(albumSongs);
  };

  const SongsTab = () => (
    <FlatList
      data={selectedArtist?.albums.flatMap((album: any) => album.songs) || []}
      keyExtractor={(item) => item.path} // Usa `path` como identificador único
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() =>
            playAllSongs(selectedArtist?.albums.flatMap((album: any) => album.songs) || [], index)
          }
        >
          <Text style={styles.songName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );

  const AlbumsTab = () => (
    <FlatList
      data={selectedArtist?.albums || []}
      keyExtractor={(item) => item.name} // Usa o nome do álbum como chave
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => showAlbumSongs(item.songs)}>
          <Text style={styles.albumName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.name} // Usa o nome do artista como chave
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToArtistDetails(item)}>
            <Text style={styles.artistName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal com Abas */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedArtist?.name}</Text>
          <TabView
            navigationState={{ index: tabIndex, routes }}
            renderScene={SceneMap({
              songs: SongsTab,
              albums: AlbumsTab,
            })}
            onIndexChange={setTabIndex}
            renderTabBar={(props) => (
              <TabBar {...props} style={styles.tabBar} indicatorStyle={styles.tabIndicator} />
            )}
          />
          <Button title="Fechar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      {/* Modal para mostrar músicas do álbum */}
      <Modal visible={selectedAlbumSongs.length > 0} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Músicas do Álbum</Text>
          <FlatList
            data={selectedAlbumSongs}
            keyExtractor={(item) => item.path} // Usa `path` como identificador único
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => playAllSongs(selectedAlbumSongs, index)}>
                <Text style={styles.songName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Fechar" onPress={() => setSelectedAlbumSongs([])} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  artistName: {
    fontSize: 18,
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    margin: 16,
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#6200EE',
  },
  tabIndicator: {
    backgroundColor: 'white',
  },
  albumName: {
    fontSize: 16,
    margin: 10,
  },
  songName: {
    fontSize: 16,
    margin: 10,
  },
});

export default ArtistsScreen;
