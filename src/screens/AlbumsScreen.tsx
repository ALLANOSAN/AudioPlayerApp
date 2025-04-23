import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetails'>;

interface Album {
  id: string;
  name: string;
  artist: string;
  cover?: string;
  songs: any[];
}

const AlbumsScreen = () => {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const [albums, setAlbums] = useState<Album[]>([]);
  const navigation = useNavigation<NavigationProp>();

  // Simular carregamento de álbuns
  useEffect(() => {
    // Este é apenas um exemplo. Na prática, você carregaria dados de uma fonte real
    const mockAlbums: Album[] = [
      {
        id: '1',
        name: 'Album 1',
        artist: 'Artist 1',
        cover: 'https://example.com/cover1.jpg',
        songs: [{ id: '1', title: 'Song 1' }, { id: '2', title: 'Song 2' }]
      },
      {
        id: '2',
        name: 'Album 2',
        artist: 'Artist 2',
        songs: [{ id: '3', title: 'Song 3' }]
      }
    ];
    
    setAlbums(mockAlbums);
  }, []);

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetails', { album });
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={[styles.albumItem, { backgroundColor: theme.card }]} 
      onPress={() => handleAlbumPress(item)}
    >
      <View style={styles.albumImageContainer}>
        {item.cover ? (
          <Image source={{ uri: item.cover }} style={styles.albumImage} />
        ) : (
          <View style={[styles.albumPlaceholder, { backgroundColor: theme.placeholder }]}>
            <Text style={styles.albumPlaceholderText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={[styles.albumName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.albumArtist, { color: theme.secondaryText }]}>{item.artist}</Text>
        <Text style={[styles.songCount, { color: theme.tertiaryText }]}>
          {t('albuns.musicas', { count: item.songs.length })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {albums.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('albuns.nenhumAlbum')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={renderAlbumItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  albumItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  albumImageContainer: {
    marginRight: 16,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  albumPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  albumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 16,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
  },
});

export default AlbumsScreen;