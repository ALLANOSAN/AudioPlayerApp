import Sound from 'react-native-sound';
import { AppState, Platform } from 'react-native';
import { Logger } from '../utils/Logger';
import { APP_STRINGS } from '../constants/strings';
import { Song } from '../types/music';
import { MediaSessionService } from './MediaSessionService'; // Assumindo que MediaSessionService será adaptado

// Habilitar a reprodução em segundo plano no iOS
Sound.setCategory('Playback');

interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering?: boolean; // react-native-sound não tem um estado de buffering explícito como expo-av
  durationMillis: number;
  positionMillis: number;
  didJustFinish?: boolean;
  error?: string;
  uri?: string;
}

export class AudioPlayer {
  private static instance: AudioPlayer;
  private sound: Sound | null = null;
  private currentSong: Song | null = null;
  private currentPlaylist: Song[] = [];
  private currentIndex: number = -1;
  private playbackStatusUpdateCallback: ((status: PlaybackStatus) => void) | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private mediaSession: MediaSessionService;
  private repeatMode: 'off' | 'one' | 'all' = 'off';
  private shuffleMode: boolean = false;
  private originalPlaylistOrder: Song[] = [];

  private constructor() {
    this.mediaSession = MediaSessionService.getInstance();
    this.setupMediaSessionCallbacks();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  private setupMediaSessionCallbacks() {
    this.mediaSession.setCallbacks({
      onPlay: () => this.resume(),
      onPause: () => this.pause(),
      onStop: () => this.stop(),
      onNext: () => this.playNext(),
      onPrevious: () => this.playPrevious(),
      onSeek: (positionSeconds: number) => this.seek(positionSeconds * 1000),
    });
  }

  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // O áudio continua tocando em background com react-native-sound se configurado corretamente
    } else if (nextAppState === 'active') {
      // App voltou ao foreground
    }
  };

  private clearProgressInterval() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private startProgressInterval() {
    this.clearProgressInterval();
    this.progressInterval = setInterval(() => {
      if (this.sound && this.sound.isLoaded() && this.sound.isPlaying()) {
        this.sound.getCurrentTime((seconds, _isPlaying) => {
          if (this.playbackStatusUpdateCallback && this.currentSong) {
            this.playbackStatusUpdateCallback({
              isLoaded: true,
              isPlaying: _isPlaying,
              durationMillis: (this.sound?.getDuration() ?? 0) * 1000,
              positionMillis: seconds * 1000,
              uri: this.currentSong.path,
            });
          }
        });
      }
    }, 1000); // Atualiza a cada segundo
  }

  private onPlaybackEnd(success: boolean) {
    this.clearProgressInterval();
    if (this.playbackStatusUpdateCallback && this.currentSong) {
      this.playbackStatusUpdateCallback({
        isLoaded: true, // Ou false se não houver próxima música
        isPlaying: false,
        didJustFinish: true,
        durationMillis: (this.sound?.getDuration() ?? 0) * 1000,
        positionMillis: (this.sound?.getDuration() ?? 0) * 1000, // Posição no final
        uri: this.currentSong.path,
      });
    }

    if (success) {
      Logger.info('Reprodução finalizada com sucesso.');
      if (this.repeatMode === 'one') {
        this.replayCurrentSong();
      } else {
        this.playNext(true); // true indica que veio de um 'didJustFinish'
      }
    } else {
      Logger.error(APP_STRINGS.ERRORS.PLAYBACK_FAILED, 'Erro desconhecido durante a reprodução.');
      // Tentar tocar a próxima se houver erro e não for modo 'one'
      if (this.repeatMode !== 'one') {
        this.playNext(true);
      }
    }
  }

  private replayCurrentSong() {
    if (this.currentSong) {
      this.playAudio(this.currentSong, this.currentPlaylist, this.currentIndex);
    }
  }

  public async playAudio(song: Song, playlist: Song[] = [], songIndex: number = 0): Promise<void> {
    if (!song || !song.path) {
      Logger.error('Tentativa de tocar música inválida ou sem caminho.');
      this.playbackStatusUpdateCallback?.({
        isLoaded: false,
        isPlaying: false,
        error: 'Música inválida',
        durationMillis: 0,
        positionMillis: 0,
      });
      return;
    }

    if (this.sound) {
      this.sound.release();
      this.sound = null;
      this.clearProgressInterval();
    }

    this.currentSong = song;
    this.currentPlaylist = [...playlist];
    this.currentIndex = songIndex;

    if (this.shuffleMode && playlist.length > 0 && this.originalPlaylistOrder.length === 0) {
      this.originalPlaylistOrder = [...playlist]; // Salva a ordem original apenas uma vez
    }

    this.playbackStatusUpdateCallback?.({
      isLoaded: false,
      isPlaying: false,
      isBuffering: true,
      durationMillis: 0,
      positionMillis: 0,
      uri: song.path,
    });

    this.sound = new Sound(song.path, '', (error) => {
      if (error) {
        Logger.error(APP_STRINGS.ERRORS.PLAYBACK_FAILED, error.message);
        this.playbackStatusUpdateCallback?.({
          isLoaded: false,
          isPlaying: false,
          error: error.message,
          durationMillis: 0,
          positionMillis: 0,
          uri: song.path,
        });
        this.mediaSession.updatePlaybackState(false, 0, 0, error.message);
        return;
      }

      if (this.sound) {
        const durationSeconds = this.sound.getDuration();
        this.playbackStatusUpdateCallback?.({
          isLoaded: true,
          isPlaying: false, // Ainda não está tocando
          durationMillis: durationSeconds * 1000,
          positionMillis: 0,
          uri: song.path,
        });

        this.mediaSession.updateMetadata({
          title: song.name,
          artist: song.artist,
          artwork: song.artwork,
          duration: durationSeconds,
          album: song.album || '',
        });
        this.mediaSession.updatePlaybackState(false, 0, durationSeconds);

        this.sound.play((success) => this.onPlaybackEnd(success));
        this.startProgressInterval();
        this.playbackStatusUpdateCallback?.({
          // Atualiza para isPlaying: true
          isLoaded: true,
          isPlaying: true,
          durationMillis: durationSeconds * 1000,
          positionMillis: 0,
          uri: song.path,
        });
        this.mediaSession.updatePlaybackState(true, 0, durationSeconds);
      }
    });
  }

  public async pause(): Promise<void> {
    if (this.sound && this.sound.isLoaded() && this.sound.isPlaying()) {
      this.sound.pause();
      this.clearProgressInterval(); // Pausa o intervalo de progresso
      const position = this.sound.getCurrentTime((seconds) => {
        this.playbackStatusUpdateCallback?.({
          isLoaded: true,
          isPlaying: false,
          durationMillis: (this.sound?.getDuration() ?? 0) * 1000,
          positionMillis: seconds * 1000,
          uri: this.currentSong?.path,
        });
        this.mediaSession.updatePlaybackState(false, seconds, this.sound?.getDuration() ?? 0);
      });
      Logger.info('Áudio pausado.');
    }
  }

  public async resume(): Promise<void> {
    if (this.sound && this.sound.isLoaded() && !this.sound.isPlaying()) {
      this.sound.play((success) => this.onPlaybackEnd(success));
      this.startProgressInterval(); // Reinicia o intervalo de progresso
      const position = this.sound.getCurrentTime((seconds) => {
        this.playbackStatusUpdateCallback?.({
          isLoaded: true,
          isPlaying: true,
          durationMillis: (this.sound?.getDuration() ?? 0) * 1000,
          positionMillis: seconds * 1000,
          uri: this.currentSong?.path,
        });
        this.mediaSession.updatePlaybackState(true, seconds, this.sound?.getDuration() ?? 0);
      });
      Logger.info('Áudio retomado.');
    }
  }

  public async stop(): Promise<void> {
    if (this.sound) {
      this.sound.stop(() => {
        this.sound?.release(); // Libera recursos após parar
        this.sound = null;
        this.clearProgressInterval();
        this.playbackStatusUpdateCallback?.({
          isLoaded: false,
          isPlaying: false,
          durationMillis: 0,
          positionMillis: 0,
          uri: this.currentSong?.path,
        });
        this.mediaSession.updatePlaybackState(false, 0, 0, 'Stopped');
        this.currentSong = null;
        this.currentIndex = -1;
        // Não limpa a playlist aqui, pode ser útil para recomeçar
        Logger.info('Áudio parado e recursos liberados.');
      });
    }
  }

  public async seek(positionMillis: number): Promise<void> {
    if (this.sound && this.sound.isLoaded()) {
      const positionSeconds = positionMillis / 1000;
      this.sound.setCurrentTime(positionSeconds);
      // O callback de progresso atualizará o estado
      if (this.playbackStatusUpdateCallback && this.currentSong) {
        this.playbackStatusUpdateCallback({
          isLoaded: true,
          isPlaying: this.sound.isPlaying(),
          durationMillis: (this.sound.getDuration() ?? 0) * 1000,
          positionMillis,
          uri: this.currentSong.path,
        });
      }
    }
  }

  public async playNext(finishedNaturally: boolean = false): Promise<void> {
    if (this.currentPlaylist.length === 0) return;

    let nextIndex = this.currentIndex + 1;

    if (this.shuffleMode) {
      if (this.currentPlaylist.length <= 1) {
        // Não há para onde ir ou só uma música
        if (this.repeatMode === 'all' && this.currentPlaylist.length === 1) {
          nextIndex = 0;
        } else if (!finishedNaturally && this.currentPlaylist.length === 1) {
          // Se for skip manual e só tem uma música, toca de novo se repeat all
          if (this.repeatMode === 'all') nextIndex = 0;
          else return;
        } else {
          if (this.repeatMode === 'all')
            nextIndex = 0; // Volta para o início se 'repeat all'
          else {
            Logger.info('Fim da playlist (shuffle).');
            // Opcional: parar player ou resetar
            // this.stop();
            return;
          }
        }
      } else {
        let randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        // Evita tocar a mesma música em seguida, a menos que seja a única
        while (randomIndex === this.currentIndex && this.currentPlaylist.length > 1) {
          randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        }
        nextIndex = randomIndex;
      }
    } else {
      // Modo não shuffle
      if (nextIndex >= this.currentPlaylist.length) {
        if (this.repeatMode === 'all') {
          nextIndex = 0; // Volta para o início
        } else {
          Logger.info('Fim da playlist.');
          // Opcional: parar player ou resetar
          // this.stop();
          return;
        }
      }
    }

    if (this.currentPlaylist[nextIndex]) {
      this.playAudio(this.currentPlaylist[nextIndex], this.currentPlaylist, nextIndex);
    }
  }

  public async playPrevious(): Promise<void> {
    if (this.currentPlaylist.length === 0) return;

    let prevIndex = this.currentIndex - 1;

    if (this.shuffleMode) {
      // Em shuffle, "previous" pode ser aleatório ou o anterior na ordem original
      // Para simplicidade, vamos pegar um aleatório diferente do atual
      if (this.currentPlaylist.length <= 1) {
        if (this.repeatMode === 'all') prevIndex = 0;
        else return;
      } else {
        let randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        while (randomIndex === this.currentIndex && this.currentPlaylist.length > 1) {
          randomIndex = Math.floor(Math.random() * this.currentPlaylist.length);
        }
        prevIndex = randomIndex;
      }
    } else {
      // Modo não shuffle
      if (prevIndex < 0) {
        if (this.repeatMode === 'all') {
          prevIndex = this.currentPlaylist.length - 1; // Vai para o final
        } else {
          // Opcional: tocar a atual do início ou não fazer nada
          if (this.currentSong) this.seek(0);
          return;
        }
      }
    }

    if (this.currentPlaylist[prevIndex]) {
      this.playAudio(this.currentPlaylist[prevIndex], this.currentPlaylist, prevIndex);
    }
  }

  public setOnPlaybackStatusUpdate(callback: (status: PlaybackStatus) => void): void {
    this.playbackStatusUpdateCallback = callback;
  }

  public removeAllListeners(): void {
    this.playbackStatusUpdateCallback = null;
    // Não precisa remover listeners do AppState aqui, pois é global para a classe
  }

  public getCurrentSong(): Song | null {
    return this.currentSong;
  }

  public getCurrentPlaybackStatus(): PlaybackStatus | null {
    if (!this.sound || !this.currentSong) {
      return {
        isLoaded: false,
        isPlaying: false,
        durationMillis: 0,
        positionMillis: 0,
      };
    }
    // getCurrentTime é assíncrono, então este é um snapshot
    // Para status real, use o callback
    let currentPosition = 0;
    this.sound.getCurrentTime((sec) => (currentPosition = sec * 1000));

    return {
      isLoaded: this.sound.isLoaded(),
      isPlaying: this.sound.isPlaying(),
      durationMillis: (this.sound.getDuration() ?? 0) * 1000,
      positionMillis: currentPosition,
      uri: this.currentSong.path,
    };
  }

  public setRepeatMode(mode: 'off' | 'one' | 'all'): void {
    this.repeatMode = mode;
    Logger.info(`Modo de repetição definido para: ${mode}`);
    // react-native-sound não tem um setLooping para 'all' em uma playlist.
    // Isso é tratado na lógica de playNext/onPlaybackEnd.
    // Para 'one', podemos usar setNumberOfLoops(-1) se a lógica de onPlaybackEnd não for suficiente.
    // No entanto, a lógica atual em onPlaybackEnd/replayCurrentSong já cobre 'one'.
  }

  public setShuffleMode(enabled: boolean): void {
    this.shuffleMode = enabled;
    Logger.info(`Modo aleatório ${enabled ? 'ativado' : 'desativado'}.`);
    if (enabled && this.currentPlaylist.length > 0) {
      this.originalPlaylistOrder = [...this.currentPlaylist]; // Salva a ordem atual se ainda não foi salva
      // A lógica de shuffle será aplicada no playNext/playPrevious
    } else if (!enabled && this.originalPlaylistOrder.length > 0) {
      // Se desabilitar shuffle, idealmente voltaria para a ordem original
      // e continuaria do índice correspondente. Isso é mais complexo.
      // Por agora, a playlist continua como está, mas o próximo/anterior será sequencial.
      // Para restaurar a ordem e o índice:
      // const currentPlayingSongId = this.currentSong?.id;
      // this.currentPlaylist = [...this.originalPlaylistOrder];
      // this.currentIndex = this.currentPlaylist.findIndex(s => s.id === currentPlayingSongId);
      // this.originalPlaylistOrder = []; // Limpa para permitir novo shuffle
    }
    Logger.info(`Modo aleatório: ${this.shuffleMode}`);
  }

  public getRepeatMode = () => this.repeatMode;
  public getShuffleMode = () => this.shuffleMode;

  // Limpeza ao desinstanciar (se necessário, mas é um singleton)
  public cleanup() {
    this.stop();
    this.removeAllListeners();
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.clearProgressInterval();
  }
}
