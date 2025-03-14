import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

interface Song {
  path: string;
  name: string;
}

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export default function SongList({ songs, onSelectSong }: SongListProps) {
  return (
    <View>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Text>{item.name}</Text>
            <Button title="Adicionar" onPress={() => onSelectSong(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  songItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
