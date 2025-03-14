import React, { useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import * as mm from 'music-metadata';
import DocumentPicker from '@react-native-documents/picker';

const SongsScreen = () => {
  const [songs, setSongs] = useState<{ path: string; name: string }[]>([]);

  const addSongsFromFolder = async () => {
    try {
      const folder = await DocumentPicker.pickDirectory(); // Permitir seleção de diretório

      // Ler os arquivos do diretório selecionado
      const files = await RNFS.readDir(folder.uri);
      const audioFiles = [];

      for (const file of files) {
        if (file.name.endsWith('.mp3') || file.name.endsWith('.m4a')) {
          audioFiles.push(file);
          const metadata = await mm.parseFile(file.path); // Usar file.path em vez de file.uri
          const songInfo = await fetchAlbumAndCover(metadata);
          console.log('Informações da música:', songInfo);
        }
      }
      setSongs(audioFiles);
    } catch (err) {
      console.error('Erro ao selecionar a pasta:', err);
    }
  };

  const fetchAlbumAndCover = async (metadata: any) => {
    const apiKey = 'c0bc9642cd67227a10ce0a129981513b'; // Substitua pela sua chave da Last.fm
    const artistName = metadata.common.artist || 'Artista Desconhecido';
    const songName = metadata.common.title || 'Título Desconhecido';

    try {
      const artistResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&api_key=${apiKey}&artist=${artistName}&format=json`);
      const albums = artistResponse.data.topalbums.album;
      const albumCover = albums.length > 0 ? albums[0].image[3]['#text'] : '';

      return {
        artist: artistName,
        song: songName,
        cover: albumCover,
      };
    } catch (error) {
      console.error('Erro ao buscar informações do álbum:', error);
    }
  };

  return (
    <View>
      <Button title="Adicionar Músicas" onPress={addSongsFromFolder} />
      <FlatList
        data={songs}
        keyExtractor={item => item.path}
        renderItem={({ item }) => (
          <View>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default SongsScreen;