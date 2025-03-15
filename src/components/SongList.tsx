import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Song } from '../types/song';

interface SongListProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  showArtist?: boolean;
  showIndex?: boolean;
  showCover?: boolean;
  style?: object;
}

export function SongList({ 
  songs, 
  onSelectSong, 
  showArtist = true, 
  showIndex = true,
  showCover = false,
  style = {}
}: SongListProps) {
  
  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => onSelectSong(item)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`Música ${item.name} por ${item.artist}`}
      accessibilityHint="Toque para reproduzir esta música"
      accessibilityRole="button"
    >
      {showIndex && (
        <View style={styles.songNumberContainer}>
          <Text style={styles.songNumber}>{index + 1}</Text>
        </View>
      )}
      
      {showCover && (
        item.cover ? (
          <FastImage
            source={{ 
              uri: item.cover,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable
            }}
            style={styles.songCover}
          />
        ) : (
          <View style={[styles.songCover, styles.defaultCover]}>
            <Text style={styles.defaultCoverText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      )}
      
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        {showArtist && (
          <Text style={styles.songArtist} numberOfLines={1} ellipsizeMode="tail">
            {item.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.path}
      renderItem={renderSongItem}
      style={[styles.songsList, style]}
      showsVerticalScrollIndicator={false}
      accessible={true}
      accessibilityLabel="Lista de músicas"
      accessibilityHint="Lista de músicas disponíveis para reprodução"
    />
  );
}

const styles = StyleSheet.create({
  songsList: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  songNumberContainer: {
    width: 30,
    alignItems: 'center',
  },
  songNumber: {
    fontSize: 14,
    color: '#888',
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  defaultCover: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCoverText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9E9E9E',
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
});
