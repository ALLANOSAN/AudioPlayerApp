import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Song } from '../types/music';
import { SongList } from './SongList';

interface SongsTabProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export function SongsTab({ songs, onSelectSong }: SongsTabProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SongList 
        songs={songs} 
        onSelectSong={onSelectSong}
        showArtist={true}
        showIndex={true}
        showCover={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  }
});