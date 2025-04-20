import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Song } from '../types/music';
import { Audio } from 'expo-av';
import SongsTab from '../components/SongsTab';
import AlbumsTab from '../components/AlbumsTab';

interface Album {
  name: string;
  songs: Song[];
}

interface Artist {
  name: string;
  albums: Album[];
}

const ArtistsScreen = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<Song[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'songs', title: 'Músicas' },
    { key: 'albums', title: 'Álbuns' },
  ]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      const queue: Song[] = [];
      organizeByArtist(queue);
    };

    loadQueue();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const organizeByArtist = (songs: Song[]) => {
    const artistMap: { [key: string]: Artist } = {};

    songs.forEach((song) => {
      const artist = song.artist || 'Desconhecido';
      const albumName = song.title || 'Sem Álbum';

      if (!artistMap[artist]) {
        artistMap[artist] = { name: artist, albums: [] };
      }

      let album = artistMap[artist].albums.find(a => a.name === albumName);
      if (!album) {
        album = { name: albumName, songs: [] };
        artistMap[artist].albums.push(album);
      }

      album.songs.push(song);
    });

    const artistList = Object.values(artistMap);
    setArtists(artistList);
  };

  const navigateToArtistDetails = (artist: Artist) => {
    setSelectedArtist(artist);
    setModalVisible(true);
  };

  const playAllSongs = (index: number) => {
    if (!selectedArtist) return;
    const songs = selectedArtist.albums.flatMap(album => album.songs);
    playSongs(songs, index);
  };

  const playSongs = async (songs: Song[], startIndex: number = 0) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: songs[startIndex].url },
        { shouldPlay: true }
      );

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          const nextIndex = startIndex + 1;
          if (nextIndex < songs.length) {
            playSongs(songs, nextIndex);
          } else {
            console.log('Fim da reprodução da lista.');
          }
        }
      });
    } catch (error) {
      console.error('Erro ao reproduzir músicas:', error);
    }
  };

  const showAlbumSongs = (songs: Song[]) => {
    setSelectedAlbumSongs(songs);
  };

  const renderScene = SceneMap({
    songs: () => <SongsTab songs={selectedArtist?.albums.flatMap(album => album.songs) || []} onPlaySong={playAllSongs} />,
    albums: () => <AlbumsTab albums={selectedArtist?.albums || []} onSelectAlbumSongs={showAlbumSongs} />,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToArtistDetails(item)}>
            <Text style={styles.artistName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{selectedArtist?.name}</Text>
          <TabView
            navigationState={{ index: tabIndex, routes }}
            renderScene={renderScene}
            onIndexChange={setTabIndex}
            renderTabBar={(props) => (
              <TabBar {...props} style={styles.tabBar} indicatorStyle={styles.tabIndicator} />
            )}
          />
          <Button title="Fechar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      <Modal visible={selectedAlbumSongs.length > 0} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Músicas do Álbum</Text>
          <FlatList
            data={selectedAlbumSongs}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => playSongs(selectedAlbumSongs, index)}>
                <Text style={styles.songName}>{item.title}</Text>
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
  songName: {
    fontSize: 16,
    margin: 10,
  },
});

export default ArtistsScreen;
