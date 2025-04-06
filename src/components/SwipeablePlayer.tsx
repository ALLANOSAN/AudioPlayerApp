import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { AudioPlayer } from '../services/AudioPlayer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/types';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage, { ImageStyle as FastImageStyle } from 'react-native-fast-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface CachedImageProps {
  uri: string | undefined;
  style: FastImageStyle;
}

const CachedImage: React.FC<CachedImageProps> = ({ uri, style }) => (
  <FastImage
    style={style}
    source={{ uri: uri || '' }}
    resizeMode={FastImage.resizeMode.cover}
  />
);

export const SwipeablePlayer = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);
  const audioPlayer = AudioPlayer.getInstance();
  const currentSong = useSelector((state: RootState) => state.player.currentSong);
  const isPlaying = useSelector((state: RootState) => state.player.isPlaying);

  const handleSwipeComplete = async (direction: 'left' | 'right') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (direction === 'left') {
      await audioPlayer.nextTrack();
    } else {
      await audioPlayer.previousTrack();
    }
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await audioPlayer.pauseAudio();
    } else {
      await audioPlayer.resumeAudio();
    }
  };

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(handlePlayPause)();
    });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      opacity.value = interpolate(
        Math.abs(translateX.value),
        [0, SCREEN_WIDTH / 2],
        [1, 0.5],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        runOnJS(handleSwipeComplete)(event.translationX > 0 ? 'right' : 'left');
      }
      translateX.value = withSpring(0);
      opacity.value = withSpring(1);
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

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
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.content}>
          <CachedImage
            uri={currentSong.artwork}
            style={styles.artwork}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <Icon 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color="#000" 
          />
        </View>
      </Animated.View>
    </GestureDetector>
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
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  }
});
