import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';

interface Album {
  id: string;
  name: string;
}

interface AlbumListProps {
  albums: Album[];
  onSelectAlbum: (album: Album) => void;
}

export function AlbumList({ albums, onSelectAlbum }: AlbumListProps) {
  return (
    <View style={styles.container}>
      {albums.length === 0 ? (
        // Exibe uma mensagem quando não houver álbuns
        <Text style={styles.emptyText}>Nenhum álbum disponível.</Text>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            // Usando Pressable para feedback visual no clique
            <Pressable
              onPress={() => onSelectAlbum(item)}
              style={({ pressed }) => [
                styles.albumItem,
                pressed && { backgroundColor: '#e6e6e6' }, // Feedback visual ao pressionar
              ]}
              accessibilityLabel={`Selecionar o álbum ${item.name}`}
            >
              <Text style={styles.albumText}>{item.name}</Text>
            </Pressable>
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
  albumItem: {
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
  albumText: {
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
