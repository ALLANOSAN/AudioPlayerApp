import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface Album {
  id: string;
  name: string;
}

interface AlbumListProps {
  albums: Album[];
  onSelectAlbum: (album: Album) => void;
}

export function AlbumList({ albums, onSelectAlbum }: AlbumListProps) {
  const [lastPress, setLastPress] = useState<number>(0);

  const handlePress = useCallback((album: Album) => {
    const time = new Date().getTime();
    const delta = time - lastPress;

    if (delta < 300) {
      onSelectAlbum(album);
    }

    setLastPress(time);
  }, [lastPress, onSelectAlbum]);

  return (
    <View>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.albumItem}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  albumItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
