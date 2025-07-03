import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Alterado
import { useTheme } from '../contexts/ThemeContext';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  shuffleMode?: boolean;
  onToggleShuffle?: () => void;
  repeatMode?: 'off' | 'one' | 'all';
  onToggleRepeat?: () => void;
  playerType?: 'mini' | 'full';
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoading,
  onPlayPause,
  onNext,
  onPrevious,
  shuffleMode,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  playerType = 'full',
}) => {
  const { theme } = useTheme();

  const getRepeatIconName = () => {
    if (repeatMode === 'one') return 'repeat-one';
    if (repeatMode === 'all') return 'repeat'; // Ou um ícone específico para 'all' se tiver
    return 'repeat';
  };

  const isMini = playerType === 'mini';
  const iconSize = isMini ? 28 : 38;
  const playIconSize = isMini ? 36 : 48;
  const playButtonSize = isMini ? 50 : 70;

  return (
    <View style={[styles.controlsContainer, isMini && styles.miniControlsContainer]}>
      {onToggleShuffle && playerType === 'full' && (
        <TouchableOpacity onPress={onToggleShuffle} style={styles.controlButton}>
          <MaterialIcons
            name={shuffleMode ? 'shuffle-on' : 'shuffle'}
            size={isMini ? 22 : 28}
            color={shuffleMode ? theme.primary : theme.text}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onPrevious} style={styles.controlButton} disabled={isLoading}>
        <MaterialIcons name="skip-previous" size={iconSize} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onPlayPause}
        style={[
          styles.playButton,
          {
            backgroundColor: theme.primary,
            width: playButtonSize,
            height: playButtonSize,
            borderRadius: playButtonSize / 2,
          },
          isMini && styles.miniPlayButton,
        ]}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size={playerType === 'mini' ? 'small' : 'large'} color="#FFFFFF" />
        ) : (
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={playIconSize}
            color="#FFFFFF"
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} style={styles.controlButton} disabled={isLoading}>
        <MaterialIcons name="skip-next" size={iconSize} color={theme.text} />
      </TouchableOpacity>

      {onToggleRepeat && playerType === 'full' && (
        <TouchableOpacity onPress={onToggleRepeat} style={styles.controlButton}>
          <MaterialIcons
            name={getRepeatIconName()}
            size={isMini ? 22 : 28}
            color={repeatMode && repeatMode !== 'off' ? theme.primary : theme.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  miniControlsContainer: {
    justifyContent: 'space-evenly', // Mais juntos para mini player
    paddingVertical: 5,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15, // Espaçamento para o botão de play
  },
  miniPlayButton: {
    marginHorizontal: 10,
  },
});
