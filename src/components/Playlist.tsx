import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';

interface Playlist {
  id: string;
  name: string;
}

interface PlaylistListProps {
  playlists: Playlist[];
  onSelectPlaylist: (playlist: Playlist) => void;
}

export function PlaylistList({ playlists, onSelectPlaylist }: PlaylistListProps) {
  return (
    <View>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistItem}>
            <Text>{item.name}</Text>
            <Button title="Selecionar" onPress={() => onSelectPlaylist(item)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playlistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});