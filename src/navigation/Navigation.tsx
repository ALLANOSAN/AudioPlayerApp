import React, { useEffect, useState, useRef, useCallback } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigation from './TabsNavigation'; // Seu componente de abas
import { PlayerScreen } from '../screens/PlayerScreen';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';
import { SwipeablePlayer } from '../components/SwipeablePlayer'; // Seu mini player
import { TrackPlayerService, PlaybackStatus as PlayerServiceStatus, Song } from '../services/TrackPlayerService'; // Import Song
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Logger } from '../utils/logger';

const Stack = createStackNavigator<RootStackParamList>();

const usePlayerStateForMiniPlayer = () => {
  const playerService = useRef(TrackPlayerService.getInstance()).current;
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Para o mini player, pode ser menos granular
  const [isVisible, setIsVisible] = useState(false);

  const statusUpdateCallbackRef = useRef<((status: PlayerServiceStatus) => void) | null>(null);

  useEffect(() => {
    statusUpdateCallbackRef.current = (status: PlayerServiceStatus) => {
      const song = playerService.getCurrentSong();
      setCurrentSong(song);
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isBuffering && status.isPlaying); // Mostra loading no miniplayer se bufferando e tentando tocar
      
      // Mini player é visível se houver uma música carregada (mesmo que pausada)
      // e não acabou de terminar (a menos que esteja em loop/repeat)
      const shouldBeVisible = !!song && status.isLoaded;
      if (isVisible !== shouldBeVisible) {
        setIsVisible(shouldBeVisible);
      }
    };

    const removeCallback = playerService.setOnPlaybackStatusUpdate(statusUpdateCallbackRef.current);

    // Pega o estado inicial
    const fetchInitialState = async () => {
        const initialStatus = await playerService.getCurrentPlaybackStatus();
        const initialSong = playerService.getCurrentSong();
        if (initialSong && initialStatus) {
            setCurrentSong(initialSong);
            setIsPlaying(initialStatus.isPlaying);
            setIsLoading(initialStatus.isBuffering && initialStatus.isPlaying);
            setIsVisible(initialStatus.isLoaded);
        }
    };
    fetchInitialState();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
            Logger.info("App ativo, atualizando estado do mini player.");
            fetchInitialState(); // Revalida o estado
        }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      removeCallback();
      appStateSubscription.remove();
    };
  }, [playerService, isVisible]); // Adicionado isVisible para reavaliar a visibilidade

  return { currentSong, isPlaying, isLoading, isVisible, playerService };
};


export default function Navigation() {
  const { navigationTheme } = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const {
    currentSong,
    isPlaying,
    isLoading, // Para o mini player
    isVisible, // Para o mini player
    playerService,
  } = usePlayerStateForMiniPlayer();

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
    // Mini player pode ter uma lógica mais simples para previous, como sempre ir para a anterior
    await playerService.playPrevious();
  };
  
  const handleOpenFullScreenPlayer = () => {
    const songToPlay = playerService.getCurrentSong();
    // A playlist para o full screen player deve ser a original, não a potencialmente embaralhada do serviço
    const originalPlaylist = playerService.getOriginalPlaylistOrder(); 
    const currentPlaylistFromService = playerService.getCurrentPlaylistInternal(); // Esta pode estar embaralhada

    if (songToPlay && navigationRef.isReady()) {
        // Encontra o índice da música atual na playlist ORIGINAL
        const songIndexInOriginalPlaylist = originalPlaylist.findIndex(s => (s.id || s.path) === (songToPlay.id || songToPlay.path));

        if (songIndexInOriginalPlaylist !== -1) {
             navigationRef.navigate('Player', { 
                song: songToPlay, 
                playlist: originalPlaylist, // Passa a playlist original
                songIndex: songIndexInOriginalPlaylist // E o índice correto nela
            });
        } else {
            // Fallback: se não encontrar na original (improvável se a lógica estiver correta),
            // tenta com a playlist atual do serviço, mas isso pode ser menos ideal se estiver embaralhada
            // e o usuário espera a ordem original na tela cheia.
            const songIndexInCurrentServicePlaylist = currentPlaylistFromService.findIndex(s => (s.id || s.path) === (songToPlay.id || songToPlay.path));
            if (songIndexInCurrentServicePlaylist !== -1) {
                 navigationRef.navigate('Player', { 
                    song: songToPlay, 
                    playlist: currentPlaylistFromService, 
                    songIndex: songIndexInCurrentServicePlaylist
                });
            } else {
                 Logger.warn("Não foi possível encontrar a música atual em nenhuma playlist para abrir o player em tela cheia.");
            }
        }
    } else {
        Logger.warn("Não foi possível abrir o player em tela cheia. Música atual ou navigationRef não prontos.");
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
                presentation: 'modal', // Efeito de modal ao abrir
                // gestureEnabled: true, // Permite fechar com gesto (iOS e alguns Androids)
            }}
        />
      </Stack.Navigator>
      {isVisible && currentSong && ( // Renderiza o mini player se estiver visível e houver uma música
        <SwipeablePlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          isLoading={isLoading} // Passa o estado de loading para o mini player
          onPlayPause={handlePlayPauseMiniPlayer}
          onNext={handleNextMiniPlayer}
          // onPrevious={handlePreviousMiniPlayer} // Opcional para mini player
          onOpenFullScreenPlayer={handleOpenFullScreenPlayer}
          isVisible={isVisible} // Controla a animação de entrada/saída do SwipeablePlayer
        />
      )}
    </NavigationContainer>
  );
}