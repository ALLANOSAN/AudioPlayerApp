import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { AudioPlayer } from '../services/AudioPlayer';
import { getPlaybackStatus } from '../store/selectors';
import { TransitionView } from './TransitionView';

export const PlayerControls = () => {
  const dispatch = useDispatch();
  const { isPlaying } = useSelector(getPlaybackStatus);
  const player = AudioPlayer.getInstance();

  const handlePlayPress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPlaying) {
      await player.pauseAudio();
    } else {
      await player.resumeAudio();
    }
  }, [isPlaying]);

  const handlePrevious = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await player.previousTrack();
  }, []);

  const handleNext = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await player.nextTrack();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrevious}>
        {/* Ícone Previous */}
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePlayPress}>
        {/* Ícone Play/Pause */}
      </TouchableOpacity>
      <TouchableOpacity onPress={handleNext}>
        {/* Ícone Next */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  }
});