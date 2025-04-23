import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Artist } from '../types/music';

interface ArtistListProps {
  artists: Artist[];
  onSelectArtist: (artist: Artist) => void;
}

export function ArtistList({ artists, onSelectArtist }: ArtistListProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  if (artists.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
          {t('artists.noArtists')}
        </Text>
      </View>
    );
  }

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={[styles.artistItem, { backgroundColor: theme.card }]}
      onPress={() => onSelectArtist(item)}
      accessibilityLabel={t('artists.accessibilityLabel', { name: item.name, count: item.songs?.length || 0 })}
      accessibilityRole="button"
    >
      <Text style={[styles.artistName, { color: theme.text }]}>
        {item.name}
      </Text>
      {item.songs && (
        <Text style={[styles.songCount, { color: theme.secondaryText }]}>
          {t('artists.songs', { count: item.songs.length })}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={artists}
      keyExtractor={(item) => item.id}
      renderItem={renderArtistItem}
      contentContainerStyle={[styles.list, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={t('artists.listAccessibilityLabel')}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  artistItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  artistName: {
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