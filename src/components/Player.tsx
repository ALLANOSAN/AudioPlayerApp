import React, { useEffect, useState } from 'react';
import { View, Button, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import TrackPlayer, { Event } from 'react-native-track-player';
import Slider from '@react-native-community/slider';

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
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const setupPlayer = async () => {
      setIsLoading(true); // Exibe o indicador de carregamento
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        id: currentSong.path,
        url: currentSong.path,
        title: currentSong.name,
        artist: currentSong.artist,
        album: currentSong.album,
      });

      setDuration(await TrackPlayer.getDuration());

      // Atualiza a posição do player manualmente usando setInterval
      const interval = setInterval(async () => {
        const progress = await TrackPlayer.getPosition();
        setCurrentTime(progress);
      }, 1000);

      setIsLoading(false); // Oculta o indicador de carregamento

      return () => {
        clearInterval(interval); // Limpa o intervalo ao desmontar
        TrackPlayer.reset();
      };
    };

    setupPlayer();
  }, [currentSong]);

  const play = async () => {
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const pause = async () => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  };

  const skipToNext = async () => {
    await TrackPlayer.skipToNext();
  };

  const skipToPrevious = async () => {
    await TrackPlayer.skipToPrevious();
  };

  const seekTo = async (time: number) => {
    await TrackPlayer.seekTo(time);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

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
      <Image source={{ uri: currentSong.cover }} style={styles.albumCover} />
      <Text style={styles.title}>{currentSong.name}</Text>
      <Text>{currentSong.artist}</Text>
      <Text>{currentSong.album}</Text>
      <Text>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
      <Button
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
        onPress={isPlaying ? pause : play}
        accessibilityLabel={isPlaying ? 'Botão para pausar música' : 'Botão para reproduzir música'}
      />
      <Button title="Próxima" onPress={skipToNext} accessibilityLabel="Avançar para próxima música" />
      <Button title="Anterior" onPress={skipToPrevious} accessibilityLabel="Voltar para música anterior" />
      <Button title="Avançar 10s" onPress={seekForward} accessibilityLabel="Avançar 10 segundos na música" />
      <Button title="Retroceder 10s" onPress={seekBackward} accessibilityLabel="Retroceder 10 segundos na música" />
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
    width: width * 0.8, // Proporção responsiva
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
});
