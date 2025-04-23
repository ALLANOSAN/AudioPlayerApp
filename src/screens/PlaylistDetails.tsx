import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react';
import { SongList } from '../components/SongList';

type Props = {
  route: RouteProp<RootStackParamList, 'PlaylistDetails'>;
};

export function PlaylistDetailsScreen({ route }: Props) {
  const { playlist } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslate();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>{playlist.name}</Text>
      <SongList
        songs={playlist.songs}
        onSelectSong={() => {}}
        showArtist={true}
        showIndex={true}
        showCover={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
