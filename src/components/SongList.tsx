import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Song } from '../types/music';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

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
  const { t } = useTranslate();
  const { theme } = useTheme();
  
  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity 
      style={[styles.songItem, { backgroundColor: theme.card }]}
      onPress={() => onSelectSong(item)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={t('musicas.acessibilidadeItem', { titulo: item.name, artista: item.artist })}
      accessibilityHint={t('musicas.acessibilidadeDica')}
      accessibilityRole="button"
    >
      {showIndex && (
        <View style={styles.songNumberContainer}>
          <Text style={[styles.songNumber, { color: theme.tertiaryText }]}>{index + 1}</Text>
        </View>
      )}
      
      {showCover && (
        item.artwork ? (
          <Image
            source={{ uri: item.artwork }}
            style={styles.songCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.songCover, styles.defaultCover, { backgroundColor: theme.placeholder }]}>
            <Text style={[styles.defaultCoverText, { color: theme.secondaryText }]}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      )}
      
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        {showArtist && (
          <Text style={[styles.songArtist, { color: theme.secondaryText }]} numberOfLines={1} ellipsizeMode="tail">
            {item.artist}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={songs}
      keyExtractor={(item) => item.id || item.path}
      renderItem={renderSongItem}
      style={[styles.songsList, style]}
      showsVerticalScrollIndicator={false}
      accessible={true}
      accessibilityLabel={t('musicas.acessibilidadeLista')}
      accessibilityHint={t('musicas.acessibilidadeListaDica')}
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
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  defaultCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCoverText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
  },
});