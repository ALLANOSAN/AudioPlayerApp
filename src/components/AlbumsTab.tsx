import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Song } from '../types/music';

interface Album {
  name: string;
  songs: Song[];
}

interface AlbumsTabProps {
  albums: Album[];
  onSelectAlbumSongs: (songs: Song[]) => void;
}

const AlbumsTab: React.FC<AlbumsTabProps> = ({ albums, onSelectAlbumSongs }) => {
  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelectAlbumSongs(item.songs)}>
          <Text style={styles.albumName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  albumName: {
    fontSize: 16,
    margin: 10,
  },
});

export default AlbumsTab;
