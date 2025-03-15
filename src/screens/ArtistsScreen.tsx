import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system'; // Alterado para expo-file-system
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Artist } from '../types/artist';
import FastImage from 'react-native-fast-image';
import DocumentPicker from '@react-native-documents/picker';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ArtistDetails'>;

const ArtistsScreen = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  // Efeito para filtrar artistas quando a busca ou a lista de artistas mudar
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArtists(artists);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = artists.filter(artist => 
      artist.name.toLowerCase().includes(query)
    );
    
    setFilteredArtists(filtered);
  }, [searchQuery, artists]);

  const loadArtists = async () => {
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
      
      // Usar um Map para armazenar artistas únicos
      const artistsMap = new Map<string, {
        name: string,
        songs: number,
        image?: string
      }>();
      
      // Primeiro passo: agrupar arquivos por artista
      for (const filePath of audioFiles) {
        // Extrair nome do arquivo para usar como consulta
        const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, "") || '';
        
        try {
          // Buscar informações do artista da API Last.fm
          const artistInfo = await fetchArtistInfo(fileName);
          const artistName = artistInfo.name || 'Artista Desconhecido';
          
          if (!artistsMap.has(artistName)) {
            artistsMap.set(artistName, {
              name: artistName,
              songs: 1,
              image: artistInfo.image
            });
          } else {
            const artist = artistsMap.get(artistName);
            if (artist) {
              artist.songs += 1;
              // Atualizar imagem se ainda não tiver uma
              if (!artist.image && artistInfo.image) {
                artist.image = artistInfo.image;
              }
            }
          }
        } catch (error) {
          console.error('Erro ao buscar informações do artista:', error);
          
          // Adicionar como artista desconhecido
          const artistName = 'Artista Desconhecido';
          if (!artistsMap.has(artistName)) {
            artistsMap.set(artistName, {
              name: artistName,
              songs: 1
            });
          } else {
            const artist = artistsMap.get(artistName);
            if (artist) {
              artist.songs += 1;
            }
          }
        }
      }
      
      // Converter o Map em um array de artistas
      const artistsArray: Artist[] = Array.from(artistsMap.entries()).map(([name, data]) => ({
        name,
        cover: data.image || '',
        image: data.image || '',
        songs: data.songs
      }));
      
      // Ordenar artistas por nome
      artistsArray.sort((a, b) => a.name.localeCompare(b.name));
      
      setArtists(artistsArray);
      setFilteredArtists(artistsArray);
    } catch (err) {
      console.error('Erro ao carregar artistas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArtistInfo = async (songName: string): Promise<{name: string, image: string}> => {
    const apiKey = 'c0bc9642cd67227a10ce0a129981513b';
    try {
      // Buscar informações da música
      const trackResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=track.search&track=${songName}&api_key=${apiKey}&format=json`);
      const tracks = trackResponse.data.results?.trackmatches?.track || [];
      
      if (tracks.length === 0) {
        return { name: 'Artista Desconhecido', image: '' };
      }
      
      const track = tracks[0];
      const artistName = track.artist;
      
      // Buscar informações do artista
      const artistResponse = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artistName}&api_key=${apiKey}&format=json`);
      const artist = artistResponse.data.artist;
      const image = artist?.image?.[3]['#text'] || '';
      
      return {
        name: artistName,
        image: image
      };
    } catch (error) {
      console.error('Erro ao buscar informações do artista:', error);
      return { name: 'Artista Desconhecido', image: '' };
    }
  };

  const navigateToArtistDetails = (artist: Artist) => {
    navigation.navigate('ArtistDetails', { artist });
  };

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity 
      style={styles.artistItem} 
      onPress={() => navigateToArtistDetails(item)}
      accessible={true}
      accessibilityLabel={`Artista ${item.name}`}
      accessibilityHint="Toque para ver detalhes do artista"
    >
      <View style={styles.artistImageContainer}>
        {item.cover ? (
          <FastImage
            style={styles.artistImage}
            source={{ uri: item.cover }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.defaultImage}>
            <Text style={styles.defaultImageText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.songCount}>{item.songs || 0} músicas</Text>
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
          placeholder="Buscar artistas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityLabel="Campo de busca"
          accessibilityHint="Digite para buscar artistas"
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
        onPress={loadArtists}
        disabled={isLoading}
        accessible={true}
        accessibilityLabel="Carregar artistas"
        accessibilityHint="Toque para selecionar uma pasta com músicas para carregar artistas"
        accessibilityState={{ disabled: isLoading }}
      >
        <Text style={styles.loadButtonText}>
          {isLoading ? 'Carregando...' : 'Carregar Artistas'}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <View 
          style={styles.loadingContainer}
          accessible={true}
          accessibilityLabel="Carregando artistas"
        >
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Carregando artistas...</Text>
        </View>
      ) : filteredArtists.length > 0 ? (
        <FlatList
          data={filteredArtists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.name}
          numColumns={2}
          contentContainerStyle={styles.artistsList}
          accessible={true}
          accessibilityLabel="Lista de artistas"
        />
      ) : artists.length > 0 ? (
        <View 
          style={styles.emptyResultContainer}
          accessible={true}
          accessibilityLabel={`Nenhum artista encontrado para ${searchQuery}`}
        >
          <Text style={styles.emptyResultText}>
            Nenhum artista encontrado para "{searchQuery}"
          </Text>
        </View>
      ) : (
        <View 
          style={styles.emptyLibraryContainer}
          accessible={true}
          accessibilityLabel="Biblioteca vazia"
        >
          <Text style={styles.emptyLibraryText}>
            Sua biblioteca está vazia. Carregue artistas para começar!
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
  artistsList: {
    paddingBottom: 16,
  },
  artistItem: {
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
  artistImageContainer: {
    aspectRatio: 1,
    width: '100%',
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  defaultImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  defaultImageText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#9e9e9e',
  },
  artistInfo: {
    padding: 12,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default ArtistsScreen;