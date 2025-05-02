import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Playlist as PlaylistType, Song } from '../types/music';

interface PlaylistProps {
  playlist: PlaylistType;
  onSelectSong?: (song: Song) => void;
  onPlayAll?: () => void;
}

export function Playlist({ playlist, onSelectSong, onPlayAll }: PlaylistProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={[styles.songItem, { backgroundColor: theme.card }]}
      onPress={() => onSelectSong && onSelectSong(item)}
      accessibilityLabel={t('playlist.songAccessibility', { 
        title: item.name, 
        artist: item.artist 
      })}
    >
      <View style={styles.indexContainer}>
        <Text style={[styles.index, { color: theme.secondaryText }]}>{index + 1}</Text>
      </View>
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.songArtist, { color: theme.secondaryText }]} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.playlistName, { color: theme.text }]}>{playlist.name}</Text>
        <Text style={[styles.songCount, { color: theme.secondaryText }]}>
          {t('playlist.songCount', { count: playlist.songs.length })}
        </Text>
        
        {onPlayAll && playlist.songs.length > 0 && (
          <TouchableOpacity 
            style={[styles.playAllButton, { backgroundColor: theme.primary }]} 
            onPress={onPlayAll}
            accessibilityLabel={t('playlist.playAll')}
          >
            <Text style={styles.playAllText}>{t('playlist.playAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {playlist.songs.length > 0 ? (
        <FlatList
          data={playlist.songs}
          keyExtractor={(item) => item.id || item.path}
          renderItem={renderSongItem}
          showsVerticalScrollIndicator={false}
          accessibilityLabel={t('playlist.songList')}
        />
      ) : (
        <View style={styles.emptySongsContainer}>
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {t('playlist.emptySongs')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  playlistName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
    marginBottom: 16,
  },
  playAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  playAllText: {
    color: 'white',
    fontWeight: '500',
  },
  songItem: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  indexContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    fontSize: 14,
  },
  songInfo: {
    flex: 1,
    marginLeft: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
  emptySongsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  }
});