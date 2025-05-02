import React, { useEffect, useState, useRef } from 'react';
import { View, Button, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { MediaSessionService } from '../services/MediaSessionService';
import { useTranslate } from '@tolgee/react';

interface Song {
  path: string;
  name: string;
  cover: string;
  artist: string;
  album: string;
}

interface PlayerProps {
  currentSong: Song;
}

export function Player({ currentSong }: PlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const mediaSession = useRef(MediaSessionService.getInstance());
  const { t } = useTranslate();

  // Funções de controle
  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      mediaSession.current.updatePlaybackState(true, currentTime, duration);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      mediaSession.current.updatePlaybackState(false, currentTime, duration);
    }
  };

  const seekTo = async (time: number) => {
    if (sound) {
      await sound.setPositionAsync(time * 1000);
      setCurrentTime(time);
      mediaSession.current.updatePlaybackState(isPlaying, time, duration);
    }
  };

  const seekForward = async () => {
    const newTime = currentTime + 10;
    if (newTime < duration) {
      await seekTo(newTime);
    }
  };

  const seekBackward = async () => {
    const newTime = currentTime - 10;
    if (newTime > 0) {
      await seekTo(newTime);
    }
  };

  const stop = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      mediaSession.current.updatePlaybackState(false, currentTime, duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    let isMounted = true;

    const setupPlayer = async () => {
      setIsLoading(true);

      if (sound) {
        await sound.unloadAsync();
      }

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.path },
          { shouldPlay: false }
        );

        newSound.setOnPlaybackStatusUpdate((status: any) => {
          if (!isMounted) return;
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);

            // Atualiza o estado da notificação
            mediaSession.current.updatePlaybackState(
              status.isPlaying,
              status.positionMillis / 1000,
              duration
            );

            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        });

        const status = await newSound.getStatusAsync();
        if (status.isLoaded && status.durationMillis !== undefined) {
          setDuration(status.durationMillis / 1000);

          // Atualiza os metadados da notificação
          mediaSession.current.updateMetadata({
            title: currentSong.name,
            artist: currentSong.artist,
            album: currentSong.album,
            artwork: currentSong.cover,
            duration: status.durationMillis / 1000,
          });
        }

        setSound(newSound);
      } catch (error) {
        console.error('Erro ao carregar áudio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupPlayer();

    // Configura os callbacks dos controles remotos
    mediaSession.current.setup();
    mediaSession.current.setCallbacks({
      onPlay: play,
      onPause: pause,
      onStop: stop,
      onNext: seekForward,
      onPrevious: seekBackward,
      onSeek: (position: number) => seekTo(position),
    });

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
      mediaSession.current.setCallbacks({});
      mediaSession.current.resetSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Carregando player...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('player.tocandoAgora')}</Text>
      <Image source={{ uri: currentSong.cover }} style={styles.albumCover} />
      <Text style={styles.songName}>{currentSong.name}</Text>
      <Text style={styles.artist}>{currentSong.artist}</Text>
      <Text>{currentSong.album}</Text>
      <Text>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
      <Button
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
        onPress={isPlaying ? pause : play}
        accessibilityLabel={isPlaying ? 'Botão para pausar música' : 'Botão para reproduzir música'}
      />
      <Button
        title="Avançar 10s"
        onPress={seekForward}
        accessibilityLabel="Avançar 10 segundos na música"
      />
      <Button
        title="Retroceder 10s"
        onPress={seekBackward}
        accessibilityLabel="Retroceder 10 segundos na música"
      />
      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        onSlidingComplete={seekTo}
        style={styles.slider}
        accessibilityLabel="Controle deslizante para ajustar o progresso da música"
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  albumCover: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 10,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songName: {
    fontSize: 16,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#888',
  },
});
