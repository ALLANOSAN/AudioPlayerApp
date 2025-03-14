import React, { useEffect, useState } from 'react';
import { View, Button, Text, Image, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';
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

  useEffect(() => {
    const setupPlayer = async () => {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add({
        id: currentSong.path,
        url: currentSong.path,
        title: currentSong.name,
        artist: currentSong.artist,
        album: currentSong.album,
      });

      const track = await TrackPlayer.getQueue();
      if (track.length > 0 && track[0].duration) {
        setDuration(track[0].duration);
      }

      const interval = setInterval(async () => {
        const { position } = await TrackPlayer.getProgress();
        setCurrentTime(position);
      }, 1000);

      return () => {
        clearInterval(interval);
        TrackPlayer.reset(); // Usando reset() no lugar de destroy()
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

  return (
    <View style={styles.container}>
      <Image source={{ uri: currentSong.cover }} style={styles.albumCover} />
      <Text style={styles.title}>{currentSong.name}</Text>
      <Text>{currentSong.artist}</Text>
      <Text>{currentSong.album}</Text>
      <Text>
        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} /
        {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
      </Text>
      <Button title={isPlaying ? 'Pausar' : 'Reproduzir'} onPress={isPlaying ? pause : play} />
      <Button title="Próxima" onPress={skipToNext} />
      <Button title="Anterior" onPress={skipToPrevious} />
      <Button title="Avançar 10s" onPress={seekForward} />
      <Button title="Retroceder 10s" onPress={seekBackward} />
      <Slider
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        onValueChange={seekTo}
        style={styles.slider}
      />
    </View>
  );
}

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
  },
  albumCover: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});