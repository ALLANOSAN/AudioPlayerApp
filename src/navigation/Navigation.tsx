import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigation from './TabsNavigation';
import { PlayerScreen } from '../screens/PlayerScreen';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { SwipeablePlayer } from '../components/SwipeablePlayer';
import {
  TrackPlayerService,
  PlaybackStatus as PlayerServiceStatus,
} from '../services/TrackPlayerService';
import { Song } from '../types/music';
import { AppState, AppStateStatus } from 'react-native';
import { Logger } from '../utils/logger';

const Stack = createStackNavigator<RootStackParamList>();

const usePlayerStateForMiniPlayer = () => {
  const playerService = useRef(TrackPlayerService.getInstance()).current;
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const statusUpdateCallbackRef = useRef<((status: PlayerServiceStatus) => void) | null>(null);

  useEffect(() => {
    statusUpdateCallbackRef.current = (status: PlayerServiceStatus) => {
      const song = playerService.getCurrentSong();
      setCurrentSong(song);
      setIsPlaying(!!status.isPlaying);
      setIsLoading(!!(status.isBuffering && status.isPlaying));
      const shouldBeVisible = !!song && !!status.isLoaded;
      if (isVisible !== shouldBeVisible) {
        setIsVisible(shouldBeVisible);
      }
    };

    const removeCallback = playerService.setOnPlaybackStatusUpdate(statusUpdateCallbackRef.current);

    const fetchInitialState = async () => {
      const initialStatus = await playerService.getCurrentPlaybackStatus();
      const initialSong = playerService.getCurrentSong();
      if (initialSong && initialStatus) {
        setCurrentSong(initialSong);
        setIsPlaying(!!initialStatus.isPlaying);
        setIsLoading(!!(initialStatus.isBuffering && initialStatus.isPlaying));
        setIsVisible(!!initialStatus.isLoaded);
      }
    };
    fetchInitialState();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        Logger.info('App ativo, atualizando estado do mini player.');
        fetchInitialState();
      }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      removeCallback();
      appStateSubscription.remove();
    };
  }, [playerService, isVisible]);

  return { currentSong, isPlaying, isLoading, isVisible, playerService };
};

export default function Navigation() {
  const { navigationTheme } = useTheme(); // Corrigido: só theme
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const { currentSong, isPlaying, isLoading, isVisible, playerService } =
    usePlayerStateForMiniPlayer();

  const handlePlayPauseMiniPlayer = async () => {
    if (isPlaying) {
      await playerService.pause();
    } else {
      await playerService.resume();
    }
  };

  const handleNextMiniPlayer = async () => {
    await playerService.playNext();
  };

  const handlePreviousMiniPlayer = async () => {
    await playerService.playPrevious();
  };

  const handleOpenFullScreenPlayer = () => {
    const songToPlay = playerService.getCurrentSong();
    const originalPlaylist = playerService.getOriginalPlaylistOrder();
    const currentPlaylistFromService = playerService.getCurrentPlaylistInternal();

    if (songToPlay && navigationRef.isReady()) {
      const songIndexInOriginalPlaylist = originalPlaylist.findIndex(
        (s) => (s.id || s.path) === (songToPlay.id || songToPlay.path)
      );

      if (songIndexInOriginalPlaylist !== -1) {
        navigationRef.navigate('Player', {
          song: songToPlay,
          playlist: originalPlaylist,
          songIndex: songIndexInOriginalPlaylist,
        });
      } else {
        const songIndexInCurrentServicePlaylist = currentPlaylistFromService.findIndex(
          (s) => (s.id || s.path) === (songToPlay.id || songToPlay.path)
        );
        if (songIndexInCurrentServicePlaylist !== -1) {
          navigationRef.navigate('Player', {
            song: songToPlay,
            playlist: currentPlaylistFromService,
            songIndex: songIndexInCurrentServicePlaylist,
          });
        } else {
          Logger.warn(
            'Não foi possível encontrar a música atual em nenhuma playlist para abrir o player em tela cheia.'
          );
        }
      }
    } else {
      Logger.warn(
        'Não foi possível abrir o player em tela cheia. Música atual ou navigationRef não prontos.'
      );
    }
  };

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabsNavigation} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
      {isVisible && currentSong && (
        <SwipeablePlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlayPause={handlePlayPauseMiniPlayer}
          onNext={handleNextMiniPlayer}
          onPrevious={handlePreviousMiniPlayer}
          onOpenFullScreenPlayer={handleOpenFullScreenPlayer}
          isVisible={isVisible}
        />
      )}
    </NavigationContainer>
  );
}
