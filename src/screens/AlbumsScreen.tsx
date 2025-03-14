import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import mm from 'music-metadata';
import RNFS from 'react-native-fs';
import TrackPlayer from 'react-native-track-player'; // Importando o TrackPlayer

const AlbumsScreen = ({ navigation }) => {
  const [albumsList, setAlbumsList] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const albumList = await getAlbums();
      const albumsWithCovers = await Promise.all(albumList.map(async (album) => {
        const cover = await fetchAlbumCover(album.artist, album.name);
        return { ...album, cover, songs: await getSongs(album) }; // Adiciona a lista de músicas
      }));
      setAlbumsList(albumsWithCovers);
    };
    fetchAlbums();
  }, []);

  const getAlbums = async () => {
    const folderPath = ''; // Defina o caminho da pasta escolhida
    const files = await RNFS.readDir(folderPath);
    const audioFiles = files.filter(file => file.name.endsWith('.mp3'));

    const albumsData = await Promise.all(audioFiles.map(async (file) => {
      const metadata = await mm.parseFile(file.path);
      return {
        name: metadata.common.album || 'Álbum Desconhecido',
        artist: metadata.common.artist || 'Artista Desconhecido',
        songs: [], // Adicione a lógica para carregar as músicas do álbum
      };
    }));

    return albumsData; // Retorna a lista de álbuns
  };

  const getSongs = async (album) => {
    // Aqui você pode implementar a lógica para obter as músicas do álbum
    return [
      { name: 'Música 1', path: 'caminho/para/musica1.mp3' },
      { name: 'Música 2', path: 'caminho/para/musica2.mp3' },
    ];
  };

  const fetchAlbumCover = async (artistName, albumName) => {
    const apiKey = 'SUA_CHAVE_API'; // Substitua pela sua chave da Last.fm
    const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&album=${albumName}&artist=${artistName}&format=json`);
    return response.data.album?.image[3]['#text'] || ''; // Obtém a URL da capa
  };

  const playSong = async (song) => {
    await TrackPlayer.setupPlayer(); // Configura o player
    await TrackPlayer.add({
      id: song.path,
      url: song.path,
      title: song.name,
      artist: 'Artista Desconhecido', // Você pode adicionar informações adicionais se necessário
    });
    TrackPlayer.play(); // Toca a música
  };

  const handleSelectAlbum = (album) => {
    navigation.navigate('AlbumDetails', { album }); // Navega para a tela de detalhes do álbum
  };

  return (
    <View>
      <FlatList
        data={albumsList} // Usando a nova variável
        keyExtractor={(item, index) => index.toString()} // Usando o índice como chave
        renderItem={({ item }) => (
          <View style={styles.albumContainer}>
            <Image source={{ uri: item.cover }} style={styles.albumCover} />
            <Text>{item.name}</Text>
            <Text>{item.artist}</Text>
            <Button title="Ver Detalhes" onPress={() => handleSelectAlbum(item)} />
            <FlatList
              data={item.songs} // Lista de músicas do álbum
              keyExtractor={(song) => song.path}
              renderItem={({ item: song }) => (
                <View style={styles.songItem}>
                  <Text onPress={() => playSong(song)} style={styles.songName}>{song.name}</Text>
                </View>
              )}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  albumContainer: {
    margin: 10,
    alignItems: 'center',
  },
  albumCover: {
    width: 100,
    height: 100,
  },
  songItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  songName: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default AlbumsScreen;
