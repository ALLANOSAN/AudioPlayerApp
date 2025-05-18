import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Logger } from '../utils/logger';
import { APP_STRINGS } from '../constants/strings';

const { MediaSessionModule } = NativeModules;
const mediaSessionEvents = new NativeEventEmitter(MediaSessionModule);

// As APIs de MediaSession do React Native são geralmente gerenciadas por bibliotecas de áudio
// como react-native-track-player ou através de módulos nativos customizados.
// react-native-sound por si só não gerencia a notificação de mídia/controles de lock screen.
// Esta classe se torna mais um wrapper para interagir com uma biblioteca que FAZ isso,
// ou para centralizar a lógica se você estiver construindo controles nativos.

// Para esta refatoração, vamos assumir que o AudioPlayer.ts irá chamar os métodos
// desta classe para *tentar* atualizar metadados, e esta classe pode, no futuro,
// integrar-se com algo como react-native-track-player ou um módulo nativo.

// Por agora, os métodos de setup e event listeners podem não fazer muito sem uma
// biblioteca de backend de media session.

export interface MediaMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string; // URL ou require()
  duration?: number; // em segundos
}

export class MediaSessionService {
  private static instance: MediaSessionService;
  private currentMetadata: MediaMetadata | null = null;
  private currentPlaybackState: {
    isPlaying: boolean;
    position: number; // segundos
    duration: number; // segundos
    speed: number;
  } = { isPlaying: false, position: 0, duration: 0, speed: 1 };

  public callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek?: (position: number) => void; // posição em segundos
    // onAudioFocusLost?: () => void; // Estes são mais complexos de gerenciar sem hooks nativos diretos
    // onAudioFocusGained?: () => void;
  } = {};

  private constructor() {
    // No React Native puro, a configuração de media session e remote commands
    // geralmente é feita por uma biblioteca de player mais completa (ex: react-native-track-player)
    // ou código nativo. react-native-sound foca na reprodução do áudio em si.
    console.log(
      'MediaSessionService: Instanciado. Integração com controles de mídia nativos pode requerer uma biblioteca adicional.'
    );
  }

  public static getInstance(): MediaSessionService {
    if (!MediaSessionService.instance) {
      MediaSessionService.instance = new MediaSessionService();
    }
    return MediaSessionService.instance;
  }

  // Este método seria chamado pelo AudioPlayer
  public updateMetadata(metadata: MediaMetadata): void {
    this.currentMetadata = metadata;
    console.log('MediaSessionService: Metadados atualizados:', metadata);
    // Aqui você chamaria a API da biblioteca de media session para atualizar os metadados na notificação/lock screen
    // Ex: TrackPlayer.updateMetadataForTrack(trackId, metadata);
  }

  // Este método seria chamado pelo AudioPlayer
  public updatePlaybackState(
    isPlaying: boolean,
    positionSeconds: number,
    durationSeconds: number,
    errorMessage?: string | null, // Adicionado para erros
    speed: number = 1
  ): void {
    this.currentPlaybackState = {
      isPlaying,
      position: positionSeconds,
      duration: durationSeconds,
      speed,
    };
    console.log(
      'MediaSessionService: Estado de reprodução atualizado:',
      this.currentPlaybackState,
      'Erro:',
      errorMessage || 'Nenhum'
    );
    // Aqui você chamaria a API da biblioteca de media session para atualizar o estado
    // Ex: TrackPlayer.updatePlaybackState({ state: isPlaying ? State.Playing : State.Paused, position, duration });
    // Se houver erro, pode-se usar um estado de erro: TrackPlayer.updatePlaybackState({ state: State.Error, error: { message: errorMessage } });
  }

  public setCallbacks(callbacks: typeof this.callbacks): void {
    this.callbacks = callbacks;
    // Aqui você configuraria os listeners para os remote commands (play, pause, next na notificação)
    // Ex: TrackPlayer.addEventListener('remote-play', callbacks.onPlay);
    //     TrackPlayer.addEventListener('remote-pause', callbacks.onPause);
    //     ...etc.
    console.log(
      'MediaSessionService: Callbacks definidos. Remote commands precisam de integração com biblioteca de player.'
    );
  }

  // Métodos para simular o acionamento dos callbacks (seriam chamados pela biblioteca de media session)
  public triggerPlay(): void {
    this.callbacks.onPlay?.();
  }
  public triggerPause(): void {
    this.callbacks.onPause?.();
  }
  public triggerStop(): void {
    this.callbacks.onStop?.();
  }
  public triggerNext(): void {
    this.callbacks.onNext?.();
  }
  public triggerPrevious(): void {
    this.callbacks.onPrevious?.();
  }
  public triggerSeek(position: number): void {
    this.callbacks.onSeek?.(position);
  }

  // O setup e os event listeners são mais complexos sem uma biblioteca de player que gerencie isso.
  // Se você estiver usando react-native-track-player, muito disso seria tratado por ele.
  public async setup(): Promise<void> {
    if (Platform.OS === 'web') return; // Não aplicável na web
    // Exemplo com react-native-track-player (você precisaria instalar e configurar)
    /*
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        stopWithApp: true, // Para a música quando o app fecha
        capabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_STOP,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
          TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          TrackPlayer.CAPABILITY_SEEK_TO,
        ],
        compactCapabilities: [
          TrackPlayer.CAPABILITY_PLAY,
          TrackPlayer.CAPABILITY_PAUSE,
          TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        ],
        notificationCapabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_STOP,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
        ],
      });
      this.registerEventListeners(); // Registra os listeners do TrackPlayer
      console.log('MediaSessionService: TrackPlayer configurado.');
    } catch (e) {
      console.error('MediaSessionService: Erro ao configurar TrackPlayer', e);
    }
    */
    console.log(
      'MediaSessionService: Setup chamado. Para funcionalidade completa, integre com uma biblioteca como react-native-track-player.'
    );
  }

  /*
  private registerEventListeners(): void {
    // Exemplo com react-native-track-player
    TrackPlayer.addEventListener(Event.RemotePlay, () => this.callbacks.onPlay?.());
    TrackPlayer.addEventListener(Event.RemotePause, () => this.callbacks.onPause?.());
    TrackPlayer.addEventListener(Event.RemoteStop, () => this.callbacks.onStop?.());
    TrackPlayer.addEventListener(Event.RemoteNext, () => this.callbacks.onNext?.());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => this.callbacks.onPrevious?.());
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => this.callbacks.onSeek?.(position));
    // Adicionar outros eventos como RemoteDuck, etc.
  }
  */

  public destroy(): void {
    // Exemplo com react-native-track-player
    // TrackPlayer.destroy();
    console.log('MediaSessionService: Destroy chamado.');
  }
}
