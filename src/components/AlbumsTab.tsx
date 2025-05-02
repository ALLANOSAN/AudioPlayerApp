import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Album, Song } from '../types/music';

interface AlbumsTabProps {
  albums: Album[];
  onSelectAlbumSongs: (songs: Song[]) => void;
}

export function AlbumsTab({ albums, onSelectAlbumSongs }: AlbumsTabProps) {
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
    <TouchableOpacity
      style={[styles.albumItem, { backgroundColor: theme.card }]}
      onPress={() => onSelectAlbumSongs(item.songs)}
      accessibilityLabel={t('albuns.selecionarAlbum', { titulo: item.name, count: item.songs.length })}
      accessibilityRole="button"
    >
      <Text style={[styles.albumName, { color: theme.text }]}>
        {item.name}
      </Text>
      <Text style={[styles.songCount, { color: theme.secondaryText }]}>
        {t('albuns.musicas', { count: item.songs.length })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbumItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        accessibilityLabel={t('albuns.listaAcessibilidade')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  albumItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  albumName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
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