import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Song } from '../types/music';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'react-native';

interface SwipeablePlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onOpen: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function SwipeablePlayer({
  currentSong,
  isPlaying,
  onPlayPause,
  onOpen,
  onNext,
  onPrevious,
}: SwipeablePlayerProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (direction === 'left' && onNext) {
      onNext();
    } else if (direction === 'right' && onPrevious) {
      onPrevious();
    }
    // Reset position
    translateX.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  const handlePlayPause = () => {
    onPlayPause();
  };

  // Gesture handlers
  const tapGesture = Gesture.Tap().onStart(() => {
    runOnJS(onOpen)();
  });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      opacity.value = interpolate(
        Math.abs(translateX.value),
        [0, 100],
        [1, 0.5],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 100) {
        runOnJS(handleSwipeComplete)(event.translationX > 0 ? 'right' : 'left');
      } else {
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    // Reset position when song changes
    translateX.value = withSpring(0);
    opacity.value = withSpring(1);
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, { backgroundColor: theme.card }, animatedStyle]}>
        <View style={styles.content}>
          {currentSong.artwork ? (
            <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, { backgroundColor: theme.placeholder }]}>
              <Text style={styles.artworkPlaceholder}>{currentSong.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: theme.text }]}
              numberOfLines={1}
              accessibilityLabel={t('player.currentSong', { title: currentSong.name })}>
              {currentSong.name}
            </Text>
            <Text style={[styles.artist, { color: theme.secondaryText }]} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePlayPause}
            accessibilityLabel={isPlaying ? t('player.pause') : t('player.play')}>
            <MaterialIcons
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={32}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>{t('player.swipeParaFechar')}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkPlaceholder: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
});
