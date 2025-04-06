import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { covers } from './covers';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { AudioPlayer } from '../services/AudioPlayer';
import { useSelector } from 'react-redux';
import { CachedImage } from './CachedImage';
import { RootState } from '../store/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export const SwipeablePlayer = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const audioPlayer = AudioPlayer.getInstance();
  const currentSong = useSelector((state: RootState) => state.player.currentSong);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      opacity.value = interpolate(
        Math.abs(translateX.value),
        [0, SCREEN_WIDTH / 2],
        [1, 0.5],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          runOnJS(audioPlayer.previousTrack)();
        } else {
          runOnJS(audioPlayer.nextTrack)();
        }
      }
      translateX.value = withSpring(0);
      opacity.value = withSpring(1);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    translateX.value = withSpring(0);
    opacity.value = withSpring(1);
  }, [currentSong]);

  if (!currentSong) return null;

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
      <CachedImage
  uri={currentSong.artwork || covers.defaultCover}
  style={styles.artwork}
/>
        <Animated.Text style={styles.title}>
          {currentSong.title}
        </Animated.Text>
        <Animated.Text style={styles.artist}>
          {currentSong.artist}
        </Animated.Text>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
