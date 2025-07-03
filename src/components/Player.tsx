import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HapticFeedback from 'react-native-haptic-feedback';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslate } from '@tolgee/react';
import { Song } from '../types/music';
import { TrackPlayerService, PlaybackStatus, RepeatMode as ServiceRepeatMode } from '../services/TrackPlayerService';
import { covers } from '../constants/covers'; // Certifique-se que este arquivo existe
import { PlayerControls } from './PlayerControls'; // Certifique-se que este componente existe
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, PlayerScreenRouteProp } from '../types/navigation';
import { Logger } from '../utils/logger';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const albumArtSize = width * 0.75;
const albumArtMarginTop = width * 0.1;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

interface PlayerProps {
    navigation: StackNavigationProp<RootStackParamList, 'Player'>;
}

export const Player: React.FC<PlayerProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslate();
  const route = useRoute<PlayerScreenRouteProp>();

  const { song: initialSongFromRoute, playlist: initialPlaylistFromRoute, songIndex: initialSongIndexFromRoute } = route.params || {};

  const playerService = useRef(TrackPlayerService.getInstance()).current;
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  // const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([]); // Gerenciado pelo playerService
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Começa como true até o player carregar
  const [isSeeking, setIsSeeking] = useState(false);
  const [repeatMode, setRepeatMode] = useState<ServiceRepeatMode>(playerService.getRepeatMode());
  const [shuffleMode, setShuffleMode] = useState(playerService.getShuffleMode());

  const statusUpdateCallbackRef = useRef<((status: PlaybackStatus) => void) | null>(null);


  useEffect(() => {
    // Define o callback uma vez e o reutiliza
    statusUpdateCallbackRef.current = (status: PlaybackStatus) => {
      if (!isSeeking) { // Só atualiza a posição do slider se o usuário não estiver arrastando
        setPosition(status.positionMillis / 1000);
      }
      setDuration(status.durationMillis / 1000);
      setIsPlaying(status.isPlaying);
      
      const songFromService = playerService.getCurrentSong();
      setCurrentSong(songFromService); // Atualiza a música atual com base no serviço

      setIsLoading(status.isBuffering || false);

      if (status.error) {
        Logger.error("Erro de playback no Player.tsx:", status.error);
        // Alert.alert(t('erro.titulo') || "Erro", t('erro.reproducaoFalhou') || "Falha na reprodução.");
        setIsLoading(false);
      }

      if (status.didJustFinish && !status.isPlaying) {
        // Se a música acabou e não está tocando (ex: fim da fila sem repeat)
        // A UI pode precisar refletir isso, como resetar a posição ou mostrar um estado "finalizado"
        // Se o repeat estiver desligado e for a última música, o player pode parar.
        if (playerService.getRepeatMode() === 'off') {
            const currentQueue = playerService.getCurrentPlaylistInternal();
            const currentSongFromSvc = playerService.getCurrentSong();
            if (currentSongFromSvc && currentQueue.indexOf(currentSongFromSvc) === currentQueue.length -1) {
                 setPosition(0); // Reseta a barra para o início
            }
        }
      }
    };

    const removeCallback = playerService.setOnPlaybackStatusUpdate(statusUpdateCallbackRef.current);

    // Carregar estado inicial e música
    const initializePlayer = async () => {
      setIsLoading(true);
      if (initialSongFromRoute && initialPlaylistFromRoute && initialSongIndexFromRoute !== undefined) {
        Logger.info(`Player.tsx: Inicializando com música: ${initialSongFromRoute.name}`);
        await playerService.playAudio(initialSongFromRoute, initialPlaylistFromRoute, initialSongIndexFromRoute);
      } else {
        // Se não há música inicial da rota, tenta pegar o estado atual do player
        const existingStatus = await playerService.getCurrentPlaybackStatus();
        const existingSong = playerService.getCurrentSong();
        if (existingSong && existingStatus) {
          setCurrentSong(existingSong);
          setIsPlaying(existingStatus.isPlaying);
          setDuration(existingStatus.durationMillis / 1000);
          setPosition(existingStatus.positionMillis / 1000);
          setIsLoading(existingStatus.isBuffering || false);
        } else {
            Logger.warn("Player.tsx: Nenhuma música inicial da rota e nenhum estado existente no player.");
            setIsLoading(false);
            // navigation.goBack(); // Opcional: voltar se não houver nada para tocar
        }
      }
      setRepeatMode(playerService.getRepeatMode());
      setShuffleMode(playerService.getShuffleMode());
      // A primeira atualização de status pelo callback deve ajustar isLoading
    };

    initializePlayer();

    return () => {
      removeCallback(); // Remove o callback específico ao desmontar
    };
  // Adicionado initialSongIndexFromRoute às dependências
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSongFromRoute, initialPlaylistFromRoute, initialSongIndexFromRoute, playerService, navigation, isSeeking]);


  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayPause = async () => {
    HapticFeedback.trigger('impactLight', hapticOptions);
    if (isPlaying) {
      await playerService.pause();
    } else {
      if (currentSong) { // Se há uma música carregada (mesmo que pausada no início da fila)
         await playerService.resume();
      } else if (initialSongFromRoute && initialPlaylistFromRoute && initialSongIndexFromRoute !== undefined) {
         // Se não há currentSong mas temos os dados da rota (ex: player foi aberto mas não iniciou)
         await playerService.playAudio(initialSongFromRoute, initialPlaylistFromRoute, initialSongIndexFromRoute);
      }
    }
  };

  const handleNext = async () => {
    HapticFeedback.trigger('impactMedium', hapticOptions);
    setIsLoading(true); // Mostra loading enquanto troca de faixa
    await playerService.playNext();
  };

  const handlePrevious = async () => {
    HapticFeedback.trigger('impactMedium', hapticOptions);
    setIsLoading(true);
    await playerService.playPrevious();
  };

  const handleSeek = async (value: number) => {
    // `value` é a posição em segundos
    await playerService.seek(value * 1000);
    setPosition(value); // Atualiza a posição imediatamente para feedback visual
    setIsSeeking(false); // Libera o seeking
  };

  const onSlidingStart = () => {
    setIsSeeking(true); // Indica que o usuário está arrastando
  };
  
  const onSliderValueChange = (value: number) => {
    // Apenas atualiza a posição visualmente enquanto arrasta, não chama seek ainda
    if (isSeeking) {
        setPosition(value);
    }
  };

  const toggleRepeatMode = async () => {
    HapticFeedback.trigger('impactLight', hapticOptions);
    const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    await playerService.setRepeatMode(newMode);
    setRepeatMode(newMode);
  };

  const toggleShuffleMode = async () => {
    HapticFeedback.trigger('impactLight', hapticOptions);
    const newShuffleMode = !shuffleMode;
    await playerService.setShuffleMode(newShuffleMode);
    setShuffleMode(newShuffleMode);
    // O serviço de player deve lidar com a atualização da fila e notificar a UI
  };

  if (isLoading && !currentSong) { // Mostra loading principal se nenhuma música estiver carregada ainda
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>{t('comum.carregando') || "Carregando..."}</Text>
      </View>
    );
  }

  if (!currentSong) { // Se após o loading não houver música
     return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialIcons name="music-off" size={64} color={theme.secondaryText} />
        <Text style={{ color: theme.text, marginTop: 20, fontSize: 18 }}>{t('player.nenhumaMusica') || "Nenhuma música para tocar."}</Text>
         <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10, backgroundColor: theme.primary, borderRadius: 5}}>
            <Text style={{ color: theme.buttonText || "white" }}>{t('comum.voltar') || "Voltar"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialIcons name="keyboard-arrow-down" size={32} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {currentSong?.album || (t('player.tocandoDe') || "Tocando de")}
        </Text>
        <TouchableOpacity onPress={() => { /* Lógica para menu de opções da música */ }} style={styles.headerButton}>
          <MaterialIcons name="more-vert" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.albumArtContainer}>
        <Image
          source={(currentSong?.artwork && currentSong.artwork.startsWith('http')) || (currentSong?.artwork && currentSong.artwork.startsWith('file:')) ? { uri: currentSong.artwork } : covers.defaultCover}
          style={styles.albumArt}
          onError={(e) => Logger.warn("Erro ao carregar imagem da capa:", e.nativeEvent.error)}
        />
      </View>

      <View style={styles.songInfoContainer}>
        <Text style={[styles.songTitle, { color: theme.text }]} numberOfLines={2}>
          {currentSong?.name || '----'}
        </Text>
        <Text style={[styles.songArtist, { color: theme.secondaryText }]} numberOfLines={1}>
          {currentSong?.artist || '----'}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1} // Evita erro se duração for 0
          value={position}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.border}
          thumbTintColor={theme.primary}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={handleSeek}
          onValueChange={onSliderValueChange}
          disabled={isLoading || duration === 0} // Desabilita se carregando ou sem duração
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: theme.secondaryText }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      <PlayerControls
        isPlaying={isPlaying}
        isLoading={isLoading && isPlaying} // Mostra loading no botão play/pause apenas se tentando tocar
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        shuffleMode={shuffleMode}
        onToggleShuffle={toggleShuffleMode}
        repeatMode={repeatMode}
        onToggleRepeat={toggleRepeatMode}
        playerType="full"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // Distribui o espaço verticalmente
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Espaço inferior para controles
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 20, // Espaço superior
    marginBottom: 10,
  },
  headerButton: {
    padding: 8, // Área de toque maior
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1, // Permite que o título ocupe o espaço central
    marginHorizontal: 10,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginVertical: albumArtMarginTop, // Margem dinâmica
    flexShrink: 1, // Permite encolher se necessário
  },
  albumArt: {
    width: albumArtSize,
    height: albumArtSize,
    borderRadius: 15, // Bordas mais arredondadas
    backgroundColor: '#e0e0e0'
  },
  songInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10, // Evita que texto muito longo encoste nas bordas
  },
  songTitle: {
    fontSize: 24, // Maior
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 18, // Maior
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 20,
  },
  progressBar: {
    width: '100%',
    height: 40, // Altura padrão do slider
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? -10 : -5, // Ajuste fino para alinhar
    paddingHorizontal: 5,
  },
  timeText: {
    fontSize: 12,
  },
});