import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

interface Artist {
  id: string;
  name: string;
  albums: Album[];
}

interface Album {
  id: string;
  name: string;
  songs: Song[];
}

interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const Tab = createMaterialTopTabNavigator();

const ArtistsScreen = () => {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumSongs, setSelectedAlbumSongs] = useState<Song[]>([]);

  // Simular carregamento de artistas (substitua por sua lógica real)
  useEffect(() => {
    // Aqui você carregaria seus artistas de uma fonte de dados real
    // Este é apenas um exemplo simples
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Artista 1',
        albums: [
          {
            id: '101',
            name: 'Álbum 1',
            songs: [
              { id: '1001', title: 'Música 1', artist: 'Artista 1', url: '' },
              { id: '1002', title: 'Música 2', artist: 'Artista 1', url: '' },
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Artista 2',
        albums: [
          {
            id: '201',
            name: 'Álbum 2',
            songs: [
              { id: '2001', title: 'Música A', artist: 'Artista 2', url: '' },
              { id: '2002', title: 'Música B', artist: 'Artista 2', url: '' },
            ]
          }
        ]
      }
    ];
    
    setArtists(mockArtists);
  }, []);

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
  };

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedAlbumSongs(album.songs);
  };

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity onPress={() => handleArtistSelect(item)}>
      <Text style={[styles.artistName, { color: theme.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity onPress={() => handleAlbumSelect(item)}>
      <Text style={[styles.artistName, { color: theme.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const AlbumsTab = () => {
    if (!selectedArtist) {
      return (
        <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('artistas.selecioneArtista')}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('albuns.porArtista', { artista: selectedArtist.name })}
        </Text>
        <FlatList
          data={selectedArtist.albums}
          keyExtractor={(item) => item.id}
          renderItem={renderAlbumItem}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {artists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('artistas.nenhumArtista')}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={artists}
            keyExtractor={(item) => item.id}
            renderItem={renderArtistItem}
          />
          
          <Modal visible={selectedAlbumSongs.length > 0} animationType="slide">
            <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedAlbum?.name}
              </Text>
              <FlatList
                data={selectedAlbumSongs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity>
                    <Text style={[styles.songName, { color: theme.text }]}>{item.title}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button 
                title={t('comum.fechar')} 
                onPress={() => setSelectedAlbumSongs([])} 
              />
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 18,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalContainer: {
    flex: 1,
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