import React from 'react';
import { FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Song } from '../types/music';

interface SongsTabProps {
  songs: Song[];
  onPlaySong: (index: number) => void;
}

const SongsTab: React.FC<SongsTabProps> = ({ songs, onPlaySong }) => {
  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <TouchableOpacity onPress={() => onPlaySong(index)}>
          <Text style={styles.songName}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  songName: {
    fontSize: 16,
    margin: 10,
  },
});

export default SongsTab;
