import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Gesture, GestureDetector, PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTranslate } from '@tolgee/react';
import { useTheme } from '../contexts/ThemeContext';
import { Song } from '../types/music';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Alterado
import { covers } from '../constants/covers';
import { PlayerControls } from './PlayerControls'; // Assumindo que PlayerControls foi criado/adaptado

const { height, width } = Dimensions.get('window');
const PLAYER_HEIGHT = 70; // Altura do mini player
const SNAP_THRESHOLD = PLAYER_HEIGHT / 2;

interface SwipeablePlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenFullScreenPlayer: () => void;
  onClose?: () => void; // Para fechar o player com swipe para baixo
  isVisible: boolean;
}

export function SwipeablePlayer({
  currentSong,
  isPlaying,
  isLoading,
  onPlayPause,
  onNext,
  onPrevious,
  onOpenFullScreenPlayer,
  onClose,
  isVisible,
}: SwipeablePlayerProps) {
  const { t } = useTranslate();
  const { theme } = useTheme();
  const translateY = useSharedValue(isVisible ? 0 : PLAYER_HEIGHT + 20); // Começa escondido em baixo
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (direction === 'left' && onNext) {
      onNext();
    } else if (direction === 'right' && onPrevious) {
      onPrevious();
    }
    // Reset position
    translateY.value = withSpring(0);
    opacity.value = withSpring(1);
  };

  const handlePlayPause = () => {
    onPlayPause();
  };

  // Gesture handlers
  const tapGesture = Gesture.Tap().onStart(() => {
    runOnJS(onOpenFullScreenPlayer)();
  });

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = startX.value + event.translationY;
      opacity.value = interpolate(
        Math.abs(translateY.value),
        [0, 100],
        [1, 0.5],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationY) > 100) {
        runOnJS(handleSwipeComplete)(event.translationY > 0 ? 'right' : 'left');
      } else {
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  const gesture = Gesture.Race(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const gestureHandler = (event: any) => {
    if (event.nativeEvent.translationY > SNAP_THRESHOLD && onClose) {
      // Swipe para baixo para fechar
      translateY.value = withTiming(PLAYER_HEIGHT + 20, {}, () => {
        runOnJS(onClose)();
      });
    } else if (event.nativeEvent.translationY < -SNAP_THRESHOLD) {
      // Swipe para cima para abrir (ou outra ação)
      // Poderia ser onOpenFullScreenPlayer se o gesto for para cima
      // Por agora, apenas volta à posição se não for um swipe de fechar
      translateY.value = withSpring(0);
    }

    if (event.nativeEvent.state === State.END) {
      if (event.nativeEvent.translationY > SNAP_THRESHOLD && onClose) {
        // Já tratado acima
      } else {
        // Volta à posição original se não atingiu o threshold de fechar
        translateY.value = withSpring(0);
      }
    }
  };

  useEffect(() => {
    // Reset position when song changes
    translateY.value = withSpring(0);
    opacity.value = withSpring(1);
  }, [currentSong]);

  if (!currentSong && !isVisible) {
    // Não renderiza nada se não houver música e não estiver visível
    return null;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} onHandlerStateChange={gestureHandler}>
      <Animated.View style={[styles.container, { backgroundColor: theme.card }, animatedStyle]}>
        <TouchableOpacity
          style={styles.touchableContent}
          onPress={onOpenFullScreenPlayer}
          activeOpacity={0.9}>
          <Image
            source={currentSong?.artwork ? { uri: currentSong.artwork } : covers.defaultCover}
            style={styles.albumArt}
          />
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={1}>
              {currentSong?.name || 'Nenhuma música'}
            </Text>
            <Text style={[styles.songArtist, { color: theme.secondaryText }]} numberOfLines={1}>
              {currentSong?.artist || 'Selecione uma música'}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.controls}>
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onPlayPause={onPlayPause}
            onNext={onNext} // Mini player pode não ter next/prev, mas deixamos a prop
            onPrevious={onPrevious}
            playerType="mini"
          />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Ou um pouco acima da tab bar se tiver
    left: 0,
    right: 0,
    height: PLAYER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', // theme.border
    elevation: 8, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ocupa o espaço disponível antes dos controles fixos
  },
  albumArt: {
    width: PLAYER_HEIGHT - 20,
    height: PLAYER_HEIGHT - 20,
    borderRadius: 4,
    marginRight: 10,
  },
  songInfo: {
    flex: 1, // Permite que o texto ocupe o espaço e seja truncado
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  songArtist: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    // Os controles agora vêm do PlayerControls, então o estilo aqui é mais para o container deles
  },
});
