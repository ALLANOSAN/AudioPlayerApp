import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

export interface Song {
  path: string;
  name: string;
  artist: string;
  cover: string;
  album: string; // Campos obrigatórios para compatibilidade
}

const mapTrackToSong = (track: any): Song => ({
  path: track.url, // Caminho do arquivo da música
  name: track.title, // Nome da música
  artist: track.artist || 'Desconhecido', // Artista
  cover: track.artwork || '', // Capa do álbum
  album: track.album || 'Sem Álbum', // Álbum
});

const ArtistsScreen = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<Song[]>([]);
  const [tabIndex, setTabIndex] = useState(0); // Aba ativa
  const [routes] = useState([
    { key: 'songs', title: 'Músicas' },
    { key: 'albums', title: 'Álbuns' },
  ]);

  useEffect(() => {
    const loadQueue = async () => {
      const queue: any[] = await TrackPlayer.getQueue(); // Tipar `queue` como `any[]`
      const songs: Song[] = queue.map(mapTrackToSong); // Converte para o formato `Song`
      organizeByArtist(songs); // Organiza músicas por artista e álbum
    };

    loadQueue();
  }, []);

  const organizeByArtist = (songs: Song[]) => {
    const artistMap: { [key: string]: any } = {};

    songs.forEach((song) => {
      const artist = song.artist;
      const album = song.album;

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

  const playAllSongs = async (songs: Song[], startIndex: number = 0) => {
    try {
      const tracks = songs.map((song) => ({
        id: song.path,
        url: song.path,
        title: song.name,
        artist: song.artist,
        album: song.album,
        artwork: song.cover,
      }));

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);

      const queue = await TrackPlayer.getQueue();
      const trackIndex = queue.findIndex((track: any) => track.id === tracks[startIndex].id);

      if (trackIndex !== -1) {
        await TrackPlayer.skip(trackIndex);
      } else {
        console.error('Erro: Música não encontrada na fila.');
      }

      await TrackPlayer.play();
    } catch (error) {
      console.error('Erro ao reproduzir músicas:', error);
    }
  };

  const showAlbumSongs = (albumSongs: Song[]) => {
    setSelectedAlbumSongs(albumSongs);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedArtist(item)}>
            <Text style={styles.artistName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modais e outros componentes */}
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
});

export default ArtistsScreen;
