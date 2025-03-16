import React from 'react';
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
  return (
    <View style={styles.container}>
      {artists.length === 0 ? (
        // Exibe mensagem de lista vazia
        <Text style={styles.emptyText}>Nenhum artista disponível.</Text>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectArtist(item)}
              activeOpacity={0.7}
              accessibilityLabel={`Selecionar o artista ${item.name}`}
            >
              <View style={styles.artistItem}>
                <Text style={styles.artistText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  artistItem: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  artistText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});
