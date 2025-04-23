import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Image } from 'react-native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Album } from '../types/music';

interface AlbumListProps {
  albums: Album[];
  onSelectAlbum: (album: Album) => void;
}

export function AlbumList({ albums, onSelectAlbum }: AlbumListProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  if (albums.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
          {t('albuns.nenhumAlbum')}
        </Text>
      </View>
    );
  }

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <Pressable
      style={({ pressed }) => [
        styles.albumItem,
        // Use transparent/card instead of pressed (que não existe no seu theme)
        { backgroundColor: pressed ? `${theme.card}80` : theme.card }
      ]}
      onPress={() => onSelectAlbum(item)}
      // Remova android_ripple ou use uma cor padrão
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      accessibilityLabel={t('albuns.acessibilidadeItem', { 
        titulo: item.name, // mudando de name para title
        artista: item.artist 
      })}
      accessibilityRole="button"
    >
      <View style={styles.albumImageContainer}>
        {item.artwork ? ( // mudando de cover para artwork
          <Image source={{ uri: item.artwork }} style={styles.albumImage} />
        ) : (
          <View style={[styles.albumPlaceholder, { backgroundColor: theme.placeholder }]}>
            <Text style={styles.albumPlaceholderText}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={[styles.albumName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
          {item.name} {/* mudando de name para title */}
        </Text>
        <Text style={[styles.albumArtist, { color: theme.secondaryText }]} numberOfLines={1} ellipsizeMode="tail">
          {item.artist}
        </Text>
        <Text style={[styles.songCount, { color: theme.tertiaryText }]}>
          {t('albuns.musicas', { count: item.songs.length })}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={albums}
      keyExtractor={(item) => item.id}
      renderItem={renderAlbumItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      accessibilityLabel={t('albuns.listaAcessibilidade')}
    />
  );
}

const styles = StyleSheet.create({

  list: {
    padding: 8,
  },
  albumItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumImageContainer: {
    marginRight: 16,
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  albumPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  albumInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  songCount: {
    fontSize: 12,
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
});