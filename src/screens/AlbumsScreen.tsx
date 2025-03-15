import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system'; // Alterado para expo-file-system
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Album } from '../types/album';
import FastImage from 'react-native-fast-image';
import DocumentPicker from '@react-native-documents/picker';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetails'>;

const AlbumsScreen = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  // Efeito para filtrar álbuns quando a busca ou a lista de álbuns mudar
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAlbums(albums);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = albums.filter(album => 
      album.name.toLowerCase().includes(query) || 
      (album.artist && album.artist.toLowerCase().includes(query))
    );
    
    setFilteredAlbums(filtered);
  }, [searchQuery, albums]);

  const getAlbums = async () => {
    try {
      setIsLoading(true);
      const folder = await DocumentPicker.pickDirectory();
      
      // Ler os arquivos do diretório selecionado
      const files = await FileSystem.readDirectoryAsync(folder.uri); // Alterado para usar expo-file-system
      const audioFiles = files.filter(filePath => 
        filePath.endsWith('.mp3') || 
        filePath.endsWith('.m4a') || 
        filePath.endsWith('.wav')
      );
      
      // Usar um Map para agrupar arquivos por álbum
      const albumsMap = new Map<string, {
        name: string,
        songs: string[],
        artist?: string,
        cover?: string
      }>();
      
      // Primeiro passo: agrupar arquivos por álbum (usando o diretório como nome do álbum)
      for (const filePath of audioFiles) { // Renomeado para filePath
        // Extrair o diretório como nome do álbum
        const pathParts = filePath.split('/');
        const albumName = pathParts[pathParts.length - 2] || 'Álbum Desconhecido';
        
        if (!albumsMap.has(albumName)) {
          albumsMap.set(albumName, {
            name: albumName,
            songs: [filePath], // Use filePath aqui
          });
        } else {
          const album = albumsMap.get(albumName);
          if (album) {
            album.songs.push(filePath); // Use filePath aqui
          }
        }
      }
      
      // Segundo passo: buscar informações do artista e capa para cada álbum
      const albumsArray: Album[] = [];
      
      // Usar Array.from para converter o Map em um array
      const albumEntries = Array.from(albumsMap.entries());
      
      for (const albumEntry of albumEntries) {
        const [albumName, albumData] = albumEntry;
        if (albumData.songs.length > 0) {
          // Usar o primeiro arquivo do álbum para obter informações do artista
          const fileName = albumData.songs[0].split('/').pop() || '';
          const songName = fileName.replace(/\.[^/.]+$/, "");
          
          try {
            // Buscar informações do álbum da API Last.fm
            const albumInfo = await fetchAlbumInfo(songName);
            
            albumsArray.push({
              id: `album-${albumName}-${Date.now()}`,
              name: albumName,
              artist: albumInfo.artist || 'Artista Desconhecido',
              cover: albumInfo.cover || '',
              songs: albumData.songs.map((path: string) => ({
                id: `song-${path}-${Date.now()}`,
                name: path.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'Música Desconhecida',
                path: path,
                artist: albumInfo.artist || 'Artista Desconhecido',
                album: albumName,
                cover: albumInfo.cover || ''
              }))
            });
          } catch (error) {
            console.error('Erro ao buscar informações do álbum:', error);
            
            // Adicionar álbum mesmo sem informações completas
            albumsArray.push({
              id: `album-${albumName}-${Date.now()}`,
              name: albumName,
              artist: 'Artista Desconhecido',
              songs: albumData.songs.map((path: string) => ({
                id: `song-${path}-${Date.now()}`,
                name: path.split('/').pop()?.replace(/\.[^/.]+$/, "") || 'Música Desconhecida',
                path: path,
                artist: 'Artista Desconhecido',
                album: albumName,
                cover: ''
              }))
            });
          }
        }
      }
      
      // Ordenar álbuns por nome
      albumsArray.sort((a, b) => a.name.localeCompare(b.name));
      
      setAlbums(albumsArray);
      setFilteredAlbums(albumsArray);
    } catch (err) {
      console.error('Erro ao carregar álbuns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbumInfo = async (songName: string): Promise<{artist: string, cover: string}> => {
    const apiKey = 'c0bc9642cd67227a10ce0a129981513b';
    try {
      // Buscar informações da música
      const trackResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${songName}&api_key=${apiKey}&format=json`);
      const tracks = trackResponse.data.results?.trackmatches?.track || [];
      
      if (tracks.length === 0) {
        return { artist: 'Artista Desconhecido', cover: '' };
      }
      
      const track = tracks[0];
      const artist = track.artist;
      
      // Buscar informações do álbum
      const albumResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&api_key=${apiKey}&artist=${artist}&format=json`);
      const albums = albumResponse.data.topalbums?.album || [];
      const cover = albums.length > 0 ? albums[0].image[3]['#text'] : '';
      
      return {
        artist: artist || 'Artista Desconhecido',
        cover: cover
      };
    } catch (error) {
      console.error('Erro ao buscar informações do álbum:', error);
      return { artist: 'Artista Desconhecido', cover: '' };
    }
  };

  const navigateToAlbumDetails = (album: Album) => {
    navigation.navigate('AlbumDetails', { album });
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumItem} 
      onPress={() => navigateToAlbumDetails(item)}
      accessible={true}
      accessibilityLabel={`Álbum ${item.name} de ${item.artist}`}
      accessibilityHint="Toque para ver detalhes do álbum"
    >
      <View style={styles.albumCoverContainer}>
        {item.cover ? (
          <FastImage
            style={styles.albumCover}
            source={{ uri: item.cover }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.defaultCover}>
            <Text style={styles.defaultCoverText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
        <Text style={styles.songCount}>{item.songs?.length || 0} músicas</Text>
      </View>
    </TouchableOpacity>
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar álbuns ou artistas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityLabel="Campo de busca"
          accessibilityHint="Digite para buscar álbuns ou artistas"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearSearch}
            accessible={true}
            accessibilityLabel="Limpar busca"
            accessibilityHint="Toque para limpar o texto de busca"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.loadButton}
        onPress={getAlbums}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel="Carregar álbuns"
        accessibilityHint="Toque para selecionar uma pasta com músicas para carregar álbuns"
        accessibilityState={{ disabled: isLoading }}
      >
        <Text style={styles.loadButtonText}>
          {isLoading ? 'Carregando...' : 'Carregar Álbuns'}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View 
          style={styles.loadingContainer}
          accessible={true}
          accessibilityLabel="Carregando álbuns"
        >
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando álbuns...</Text>
        </View>
      ) : filteredAlbums.length > 0 ? (
        <FlatList
          data={filteredAlbums}
          renderItem={renderAlbumItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.albumsList}
          accessible={true}
          accessibilityLabel="Lista de álbuns"
        />
      ) : albums.length > 0 ? (
        <View 
          style={styles.emptyResultContainer}
          accessible={true}
          accessibilityLabel={`Nenhum álbum encontrado para ${searchQuery}`}
        >
          <Text style={styles.emptyResultText}>
            Nenhum álbum encontrado para "{searchQuery}"
          </Text>
        </View>
      ) : (
        <View 
          style={styles.emptyLibraryContainer}
          accessible={true}
          accessibilityLabel="Biblioteca vazia"
        >
          <Text style={styles.emptyLibraryText}>
            Sua biblioteca está vazia. Carregue álbuns para começar!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 12,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#888',
  },
  loadButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  albumsList: {
    paddingBottom: 16,
  },
  albumItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  albumCoverContainer: {
    aspectRatio: 1,
    width: '100%',
  },
  albumCover: {
    width: '100%',
    height: '100%',
  },
  defaultCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCoverText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#9e9e9e',
  },
  albumInfo: {
    padding: 12,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyResultText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyLibraryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyLibraryText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AlbumsScreen;