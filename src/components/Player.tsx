import React, { useEffect, useState, useRef } from 'react';
import { View, Button, Text, Image, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { NotificationService } from '../services/NotificationService';

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
  const notificationService = useRef(NotificationService.getInstance());

  useEffect(() => {
    const setupPlayer = async () => {
      setIsLoading(true); // Exibe o indicador de carregamento

      // Configurar callbacks para controles remotos
      notificationService.current.setOnRemotePlay(() => {
        play();
      });
      
      notificationService.current.setOnRemotePause(() => {
        pause();
      });
      
      notificationService.current.setOnRemoteStop(() => {
        if (sound) {
          sound.stopAsync().then(() => setIsPlaying(false));
        }
      });
      
      notificationService.current.setOnRemoteSeek((position) => {
        seekTo(position);
      });
      
      notificationService.current.setOnRemoteNext(() => {
        seekForward();
      });
      
      notificationService.current.setOnRemotePrevious(() => {
        seekBackward();
      });

      // Libere o som anterior, se existir
      if (sound) {
        await sound.unloadAsync();
      }

      try {
        // Cria um novo som
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.path },
          { shouldPlay: false }
        );

        // Acompanhe atualizações de progresso
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000); // Atualiza o progresso
            
            // Atualiza o estado da notificação
            notificationService.current.updatePlaybackState(
              status.isPlaying,
              status.positionMillis / 1000
            );
            
            if (status.didJustFinish) {
              setIsPlaying(false); // Atualiza o estado quando terminar
            }
          }
        });

        // Obtém informações sobre a duração do áudio
        const status = await newSound.getStatusAsync();
        if (status.isLoaded && status.durationMillis !== undefined) {
          setDuration(status.durationMillis / 1000); // Define a duração em segundos
          
          // Atualiza os metadados da notificação
          notificationService.current.updateNotificationMetadata(
            currentSong.name,
            currentSong.artist,
            currentSong.cover,
            status.durationMillis / 1000
          );
        }

        setSound(newSound);
      } catch (error) {
        console.error('Erro ao carregar áudio:', error);
      } finally {
        setIsLoading(false); // Oculta o indicador de carregamento
      }
    };

    setupPlayer();

    return () => {
      // Limpa o som ao desmontar
      if (sound) {
        sound.unloadAsync();
      }
      
      // Limpa a notificação
      notificationService.current.resetNotification();
    };
  }, [currentSong]);

  const play = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      notificationService.current.updatePlaybackState(true, currentTime);
    }
  };

  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      notificationService.current.updatePlaybackState(false, currentTime);
    }
  };

  const seekTo = async (time: number) => {
    if (sound) {
      await sound.setPositionAsync(time * 1000); // Define a posição em milissegundos
      notificationService.current.updatePlaybackState(isPlaying, time);
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