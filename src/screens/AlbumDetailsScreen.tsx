import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

type AlbumDetailsScreenRouteProp = RouteProp<RootStackParamList, 'AlbumDetails'>;
type AlbumDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumDetails'>;

interface AlbumDetailsScreenProps {
  route: AlbumDetailsScreenRouteProp;
  navigation: AlbumDetailsScreenNavigationProp;
}

export function AlbumDetailsScreen({ route, navigation }: AlbumDetailsScreenProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const { album } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  // Função para reproduzir uma música
  const handlePlaySong = (song: any) => {
    navigation.navigate('Player', { 
      song, 
      playlist: album.songs, 
      songIndex: album.songs.findIndex(s => s.id === song.id)
    });
  };

  // Função para reproduzir todas as músicas
  const handlePlayAll = () => {
    if (album.songs.length === 0) {
      Alert.alert(t('albuns.semMusicas'), t('albuns.albumVazio'));
      return;
    }

    // Lógica para reproduzir todas as músicas
    handlePlaySong(album.songs[0]);
  };

  // Função para reproduzir músicas em ordem aleatória
  const handleShufflePlay = () => {
    if (album.songs.length === 0) {
      Alert.alert(t('albuns.semMusicas'), t('albuns.albumVazio'));
      return;
    }

    // Lógica para reprodução aleatória
    const randomIndex = Math.floor(Math.random() * album.songs.length);
    handlePlaySong(album.songs[randomIndex]);
  };

  // Função para voltar
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backButtonTop} onPress={handleBackPress}>
        <Text style={[styles.backButtonText, { color: theme.primary }]}>{t('comum.voltar')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        {album.artwork ? (
          <Image source={{ uri: album.artwork }} style={styles.albumCover} resizeMode="cover" />
        ) : (
          <View
            style={[
              styles.albumCover,
              styles.albumCoverPlaceholder,
              { backgroundColor: theme.placeholder },
            ]}>
            <Text style={styles.albumCoverPlaceholderText}>{album.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.albumInfo}>
          <Text style={[styles.albumTitle, { color: theme.text }]}>{album.name}</Text>
          <Text style={[styles.albumArtist, { color: theme.secondaryText }]}>{album.artist}</Text>
          <Text style={[styles.songCount, { color: theme.tertiaryText }]}>
            {t('albuns.musicas', { count: album.songs.length })}
          </Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>{t('comum.carregando')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.playAllButton, { backgroundColor: theme.primary }]}
        onPress={handlePlayAll}>
        <Text style={styles.playAllButtonText}>{t('albuns.tocarTodas')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shuffleButton, { backgroundColor: theme.secondary }]}
        onPress={handleShufflePlay}>
        <Text style={styles.shuffleButtonText}>{t('albuns.modoAleatorio')}</Text>
      </TouchableOpacity>

      <FlatList
        data={album.songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Text style={{ color: theme.text }}>{item.name}</Text>
            <Text style={{ color: theme.secondaryText }}>{item.artist}</Text>
          </View>
        )}
      />
      <Text style={styles.info}>{t('albuns.totalMusicas', { count: album.songs.length })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButtonTop: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  albumCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumCoverPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  albumInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 16,
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  playAllButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  playAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shuffleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  shuffleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  info: {
    marginTop: 16,
    color: '#888',
    fontSize: 14,
  },
});

export default AlbumDetailsScreen;
