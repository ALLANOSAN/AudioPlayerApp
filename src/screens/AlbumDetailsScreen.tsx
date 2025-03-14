import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { AlbumList } from '../components/AlbumList'; // Importando o AlbumList

interface Song {
  path: string;
  name: string;
}

interface Album {
  id: string;
  name: string;
  artist: string;
  songs: Song[];
}

interface AlbumDetailsScreenProps {
  route: {
    params: {
      album: Album;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export function AlbumDetailsScreen({ route, navigation }: AlbumDetailsScreenProps) {
  const { album } = route.params; // Recebe o álbum selecionado
  const [lastPress, setLastPress] = useState<number>(0);

  const handlePlaySong = (song: Song) => {
    // Lógica para tocar a música
    console.log('Tocando música:', song);
  };

  const handlePress = useCallback((song: Song) => {
    const time = new Date().getTime();
    const delta = time - lastPress;

    if (delta < 300) {
      handlePlaySong(song);
    }

    setLastPress(time);
  }, [lastPress, handlePlaySong]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{album.name}</Text>
      <Text>Artista: {album.artist}</Text>
      <FlatList
        data={album.songs} // Supondo que você tenha uma lista de músicas no objeto album
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.songItem}>
              <Text>{item.name}</Text>
              <Button title="Tocar" onPress={() => handlePlaySong(item)} />
            </View>
          </TouchableOpacity>
        )}
      />
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  songItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});