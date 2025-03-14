import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface Artist {
  id: string;
  name: string;
}

interface ArtistListProps {
  artists: Artist[];
  onSelectArtist: (artist: Artist) => void;
}

export function ArtistList({ artists, onSelectArtist }: ArtistListProps) {
  const [lastPress, setLastPress] = useState<number>(0);

  const handlePress = useCallback((artist: Artist) => {
    const time = new Date().getTime();
    const delta = time - lastPress;

    if (delta < 300) {
      onSelectArtist(artist);
    }

    setLastPress(time);
  }, [lastPress, onSelectArtist]);

  return (
    <View>
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.artistItem}>
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  artistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});