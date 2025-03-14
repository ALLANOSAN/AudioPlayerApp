import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import mm from 'music-metadata';
import RNFS from 'react-native-fs';

const ArtistsScreen = () => {
  const [artistsList, setArtistsList] = useState([]); // Renomeando a variável para evitar conflito

  useEffect(() => {
    const fetchArtists = async () => {
      const artistList = await getArtists(); // Chama a função para buscar artistas
      const artistsWithCovers = await Promise.all(artistList.map(async (artist) => {
        const cover = await fetchArtistCover(artist.name);
        return { ...artist, cover };
      }));
      setArtistsList(artistsWithCovers); // Atualiza o estado com a nova lista de artistas
    };
    fetchArtists();
  }, []);

  const getArtists = async () => {
    const folderPath = ''; // Defina o caminho da pasta escolhida
    const files = await RNFS.readDir(folderPath);
    const audioFiles = files.filter(file => file.name.endsWith('.mp3'));

    const artistsData = await Promise.all(audioFiles.map(async (file) => {
      const metadata = await mm.parseFile(file.path);
      return {
        name: metadata.common.artist || 'Artista Desconhecido',
      };
    }));

    // Remover duplicatas
    const uniqueArtists = Array.from(new Set(artistsData.map(a => a.name)))
      .map(name => {
        return artistsData.find(a => a.name === name);
      });

    return uniqueArtists; // Retorna a lista de artistas
  };

  const fetchArtistCover = async (artistName) => {
    const apiKey = 'c0bc9642cd67227a10ce0a129981513b'; // Substitua pela sua chave da Last.fm
    const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${apiKey}&artist=${artistName}&format=json`);
    return response.data.artist?.image[3]['#text'] || ''; // Obtém a URL da capa
  };

  return (
    <View>
      <FlatList
        data={artistsList} // Usando a nova variável
        keyExtractor={(item, index) => index.toString()} // Usando o índice como chave
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.cover }} style={styles.artistCover} />
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  artistCover: {
    width: 100,
    height: 100,
  },
});

export default ArtistsScreen;
