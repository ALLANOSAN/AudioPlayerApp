import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle?: () => void;
  onRepeat?: () => void;
  shuffleMode?: boolean;
  repeatMode?: 'off' | 'one' | 'all';
  disabled?: boolean;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffle,
  onRepeat,
  shuffleMode = false,
  repeatMode = 'off',
  disabled = false,
}: PlayerControlsProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPlayPause();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNext();
  };

  const handlePrevious = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPrevious();
  };

  const handleShuffle = () => {
    if (onShuffle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onShuffle();
    }
  };

  const handleRepeat = () => {
    if (onRepeat) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRepeat();
    }
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'off':
        return 'repeat';
      case 'one':
        return 'repeat-one';
      case 'all':
        return 'repeat';
    }
  };

  return (
    <View style={styles.container}>
      {onShuffle && (
        <TouchableOpacity
          onPress={handleShuffle}
          style={styles.secondaryButton}
          disabled={disabled}
          accessibilityLabel={t('player.modoAleatorio')}
          accessibilityRole="button">
          <MaterialIcons
            name="shuffle"
            size={24}
            color={shuffleMode ? theme.primary : theme.secondaryText}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handlePrevious}
        style={styles.mainButton}
        disabled={disabled}
        accessibilityLabel={t('player.anterior')}
        accessibilityRole="button">
        <MaterialIcons
          name="skip-previous"
          size={36}
          color={disabled ? theme.secondaryText : theme.text}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePlayPause}
        style={[
          styles.playButton,
          { backgroundColor: disabled ? theme.secondaryText : theme.primary },
        ]}
        disabled={disabled}
        accessibilityLabel={isPlaying ? t('player.pausar') : t('player.reproduzir')}
        accessibilityRole="button">
        <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={36} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNext}
        style={styles.mainButton}
        disabled={disabled}
        accessibilityLabel={t('player.proximo')}
        accessibilityRole="button">
        <MaterialIcons
          name="skip-next"
          size={36}
          color={disabled ? theme.secondaryText : theme.text}
        />
      </TouchableOpacity>

      {onRepeat && (
        <TouchableOpacity
          onPress={handleRepeat}
          style={styles.secondaryButton}
          disabled={disabled}
          accessibilityLabel={t('player.repetir')}
          accessibilityRole="button">
          <MaterialIcons
            name={getRepeatIcon()}
            size={24}
            color={repeatMode !== 'off' ? theme.primary : theme.secondaryText}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  secondaryButton: {
    padding: 8,
  },
  mainButton: {
    padding: 12,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controls: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  button: { padding: 12, backgroundColor: '#4CAF50', borderRadius: 8, marginHorizontal: 8 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default PlayerControls;
