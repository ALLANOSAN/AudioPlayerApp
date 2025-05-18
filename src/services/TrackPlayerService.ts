import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode as TPRepeatMode,
  Event,
  State,
  Track,
  Progress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { AppState, AppStateStatus } from 'react-native';
import { Logger } from '../utils/logger';
import { APP_STRINGS } from '../constants/strings'; // Certifique-se que este arquivo existe
import { Song } from '../types/music'; // Certifique-se que este tipo está definido

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering?: boolean;
  durationMillis: number;
  positionMillis: number;
  didJustFinish?: boolean;
  error?: string;
  uri?: string;
  currentTrackId?: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

export class TrackPlayerService {
  private static instance: TrackPlayerService;
  private playbackStatusUpdateCallbacks: Array<(status: PlaybackStatus) => void> = [];
  private currentPlaylist: Song[] = [];
  private originalPlaylistOrder: Song[] = []; // Para restaurar a ordem ao desativar o shuffle
  private currentIndexInPlayerQueue: number = -1; // Índice na fila ATUAL do TrackPlayer (pode ser embaralhada)
  private currentTrackPlayerId: string | undefined = undefined;

  private repeatMode: RepeatMode = 'off';
  private shuffleMode: boolean = false;

  private constructor() {
    this.setupPlayer();
    this.registerEventListeners();
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  public static getInstance(): TrackPlayerService {
    if (!TrackPlayerService.instance) {
      TrackPlayerService.instance = new TrackPlayerService();
    }
    return TrackPlayerService.instance;
  }

  private async setupPlayer() {
    try {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
        waitForBuffer: true,
      });
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1, // em segundos
      });
      Logger.info('TrackPlayer Service: Player configurado.');
    } catch (error) {
      Logger.error('TrackPlayer Service: Erro ao configurar player', error);
    }
  }

  private notifyStatusUpdate(status: PlaybackStatus) {
    this.playbackStatusUpdateCallbacks.forEach(cb => cb(status));
  }

  private onPlaybackStateChange = async (data: { state: State }) => {
    Logger.info('TrackPlayer Event: PlaybackState', data.state);
    const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
    const currentTrack = activeTrackIndex !== undefined ? await TrackPlayer.getTrack(activeTrackIndex) : null;
    const progress = await TrackPlayer.getProgress();

    let isPlaying = false;
    let isBuffering = false;
    let isLoaded = false;
    let didJustFinish = false;

    switch (data.state) {
      case State.Playing: isPlaying = true; isLoaded = true; break;
      case State.Paused: isLoaded = true; break;
      case State.Buffering: case State.Connecting: isBuffering = true; isLoaded = true; break;
      case State.Stopped: isLoaded = false; break; // Ou true se parou mas ainda carregado
      case State.Ended:
        isLoaded = true; // A faixa terminou, mas o player ainda está "carregado" com a fila
        didJustFinish = true;
        // A lógica de playNext/repeat é gerenciada pelo TrackPlayer com RepeatMode.Queue
        // ou pelo onPlaybackTrackChanged se a faixa realmente mudar.
        // Se RepeatMode.Off e for a última faixa, o estado pode ir para Stopped ou None.
        break;
      case State.Error: Logger.error('TrackPlayer State: Error'); isLoaded = false; break;
      case State.None: isLoaded = false; break; // Player não inicializado ou resetado
    }
    
    this.currentTrackPlayerId = currentTrack?.id;

    this.notifyStatusUpdate({
      isPlaying,
      isBuffering,
      isLoaded,
      didJustFinish,
      durationMillis: (currentTrack?.duration ?? progress.duration ?? 0) * 1000,
      positionMillis: progress.position * 1000,
      uri: currentTrack?.url,
      currentTrackId: currentTrack?.id,
    });
  };

  private onPlaybackTrackChange = async (data: { track?: string | null; nextTrack?: string | null, position?: number }) => {
    Logger.info('TrackPlayer Event: PlaybackTrackChanged', data);
    // `data.nextTrack` é o ID da faixa que vai começar a tocar.
    // `data.track` é o ID da faixa que acabou de tocar (pode ser null se a fila terminou).
    if (data.nextTrack) {
      const nextTrackIndexInPlayer = await TrackPlayer.getActiveTrackIndex();
      if (nextTrackIndexInPlayer !== undefined) {
        this.currentIndexInPlayerQueue = nextTrackIndexInPlayer;
        const track = await TrackPlayer.getTrack(nextTrackIndexInPlayer);
        if (track) {
          this.currentTrackPlayerId = track.id;
          const progress = await TrackPlayer.getProgress(); // Posição será 0 para nova faixa
          const state = await TrackPlayer.getPlaybackState();
          this.notifyStatusUpdate({
            isPlaying: state.state === State.Playing,
            isLoaded: true,
            durationMillis: (track.duration ?? 0) * 1000,
            positionMillis: progress.position * 1000,
            uri: track.url,
            currentTrackId: track.id,
          });
        }
      }
    } else if (!data.nextTrack && data.track) { // Fim da fila e não está repetindo a fila
        Logger.info('TrackPlayer Event: Fim da fila de reprodução.');
        // O estado de PlaybackState (Ended, Stopped) deve tratar a UI.
        // Se o repeatMode não for Queue, o player para.
        const state = await TrackPlayer.getPlaybackState();
        if (state.state === State.Stopped || state.state === State.None || state.state === State.Ended) {
             this.notifyStatusUpdate({
                isPlaying: false, isLoaded: false, durationMillis: 0, positionMillis: 0, didJustFinish: true, currentTrackId: this.currentTrackPlayerId
            });
        }
    }
  };

  private onPlaybackProgressUpdate = (data: Progress) => {
    // Evita spam de logs
    // Logger.debug('TrackPlayer Event: PlaybackProgressUpdated', data);
    if (this.currentTrackPlayerId) { // Apenas atualiza se houver uma faixa ativa
      const state = TrackPlayer.getPlaybackState(); // Pega o estado atual síncrono
      this.notifyStatusUpdate({
        isPlaying: state.state === State.Playing,
        isLoaded: true,
        durationMillis: data.duration * 1000,
        positionMillis: data.position * 1000,
        uri: this.getCurrentSong()?.path, // Pega o path da música atual no nosso serviço
        currentTrackId: this.currentTrackPlayerId,
        isBuffering: state.state === State.Buffering || state.state === State.Connecting,
      });
    }
  };

  private onPlaybackError = (error: any) => {
    Logger.error('TrackPlayer Event: PlaybackError', error);
    this.notifyStatusUpdate({
      isPlaying: false,
      isLoaded: false,
      durationMillis: 0,
      positionMillis: 0,
      error: error.message || APP_STRINGS.ERRORS.PLAYBACK_FAILED || "Playback Error",
      uri: this.getCurrentSong()?.path,
      currentTrackId: this.currentTrackPlayerId,
    });
  };
  
  private registerEventListeners() {
    TrackPlayer.addEventListener(Event.PlaybackState, this.onPlaybackStateChange);
    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, this.onPlaybackTrackChange);
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, this.onPlaybackProgressUpdate);
    TrackPlayer.addEventListener(Event.PlaybackError, this.onPlaybackError);
    TrackPlayer.addEventListener(Event.RemotePlay, () => this.resume());
    TrackPlayer.addEventListener(Event.RemotePause, () => this.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, () => this.playNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => this.playPrevious());
    TrackPlayer.addEventListener(Event.RemoteStop, () => this.stop());
    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => this.seek(event.position * 1000));
     // Adicionar RemoteDuck para lidar com interrupções de áudio
    TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
        Logger.info('TrackPlayer Event: RemoteDuck', event);
        if (event.paused) { // Interrupção temporária (ex: notificação sonora)
            await TrackPlayer.pause();
        } else if (event.permanent) { // Interrupção permanente (ex: outra app de música começou a tocar)
            await TrackPlayer.stop();
        } else { // Fim da interrupção
            await TrackPlayer.play();
        }
    });
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    Logger.info(`TrackPlayer Service: AppState mudou para ${nextAppState}`);
    // Lógica adicional se necessário, por exemplo, para revalidar o estado do player
    if (nextAppState === 'active') {
        this.getCurrentPlaybackStatus().then(status => {
            if (status) this.notifyStatusUpdate(status);
        });
    }
  };

  public async playAudio(songToPlay: Song, playlist: Song[], songIndexInOriginalPlaylist: number): Promise<void> {
    if (!songToPlay || !songToPlay.path) {
      Logger.error('TrackPlayer Service: Tentativa de tocar música inválida.');
      this.notifyStatusUpdate({ isLoaded: false, isPlaying: false, error: 'Música inválida', durationMillis: 0, positionMillis: 0 });
      return;
    }

    Logger.info(`TrackPlayer Service: playAudio - Música: ${songToPlay.name}, Índice na Original: ${songIndexInOriginalPlaylist}`);
    Logger.debug('Playlist recebida:', playlist);

    this.originalPlaylistOrder = [...playlist]; // Salva a playlist na ordem original
    let playerQueue: Track[] = this.originalPlaylistOrder.map(s => ({
      id: s.id || s.path,
      url: s.path,
      title: s.name,
      artist: s.artist,
      album: s.album,
      artwork: s.artwork || undefined, // TrackPlayer espera undefined, não string vazia para artwork
      duration: s.duration && s.duration > 0 ? s.duration / 1000 : undefined, // em segundos
    }));

    let trackIndexToStartInPlayerQueue = songIndexInOriginalPlaylist;

    if (this.shuffleMode && playerQueue.length > 1) {
      Logger.info('TrackPlayer Service: Aplicando shuffle.');
      const currentSongTrack = playerQueue[songIndexInOriginalPlaylist];
      let otherTracks = playerQueue.filter((_, idx) => idx !== songIndexInOriginalPlaylist);
      for (let i = otherTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
      }
      playerQueue = [currentSongTrack, ...otherTracks];
      trackIndexToStartInPlayerQueue = 0; // A música selecionada é agora a primeira na fila embaralhada
      Logger.debug('Fila embaralhada para o player:', playerQueue.map(t=>t.title));
    }
    
    // Atualiza currentPlaylist para refletir a ordem que o player usará
    this.currentPlaylist = playerQueue.map(track => 
        this.originalPlaylistOrder.find(s => (s.id || s.path) === track.id) as Song
    ).filter(Boolean); // Filtra caso algum find retorne undefined

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(playerQueue);
      
      if (trackIndexToStartInPlayerQueue >= 0 && trackIndexToStartInPlayerQueue < playerQueue.length) {
        await TrackPlayer.skip(trackIndexToStartInPlayerQueue);
        this.currentIndexInPlayerQueue = trackIndexToStartInPlayerQueue;
      } else if (playerQueue.length > 0) {
        // Fallback para a primeira música se o índice for inválido
        await TrackPlayer.skip(0);
        this.currentIndexInPlayerQueue = 0;
      }
      
      await TrackPlayer.play();
      const currentTrack = await TrackPlayer.getTrack(this.currentIndexInPlayerQueue);
      this.currentTrackPlayerId = currentTrack?.id;
      Logger.info(`TrackPlayer Service: Tocando ${currentTrack?.title || songToPlay.name}`);
    } catch (error) {
      Logger.error('TrackPlayer Service: Erro ao tocar áudio', error);
      this.notifyStatusUpdate({ isLoaded: false, isPlaying: false, error: (error as Error).message, durationMillis: 0, positionMillis: 0, uri: songToPlay.path });
    }
  }

  public async pause(): Promise<void> {
    try {
      await TrackPlayer.pause();
      Logger.info('TrackPlayer Service: Áudio pausado.');
    } catch (error) { Logger.error('TrackPlayer Service: Erro ao pausar', error); }
  }

  public async resume(): Promise<void> {
    try {
      await TrackPlayer.play();
      Logger.info('TrackPlayer Service: Áudio retomado.');
    } catch (error) { Logger.error('TrackPlayer Service: Erro ao retomar', error); }
  }

  public async stop(): Promise<void> {
    try {
      await TrackPlayer.stop(); // Para a reprodução e limpa notificações
      // await TrackPlayer.reset(); // Se quiser limpar a fila também
      Logger.info('TrackPlayer Service: Áudio parado.');
    } catch (error) { Logger.error('TrackPlayer Service: Erro ao parar', error); }
  }

  public async seek(positionMillis: number): Promise<void> {
    try {
      await TrackPlayer.seekTo(positionMillis / 1000);
    } catch (error) { Logger.error('TrackPlayer Service: Erro ao buscar posição', error); }
  }

  public async playNext(): Promise<void> {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) { Logger.warn('TrackPlayer Service: Sem próxima faixa ou erro ao pular.', error); }
  }

  public async playPrevious(): Promise<void> {
    try {
      // Se estiver nos primeiros segundos da música, vai para a anterior. Senão, reinicia a atual.
      const progress = await TrackPlayer.getProgress();
      if (progress.position < 3) { // Menos de 3 segundos
        await TrackPlayer.skipToPrevious();
      } else {
        await TrackPlayer.seekTo(0);
      }
    } catch (error) { Logger.warn('TrackPlayer Service: Sem faixa anterior ou erro ao pular.', error); }
  }

  public setOnPlaybackStatusUpdate(callback: (status: PlaybackStatus) => void): () => void {
    this.playbackStatusUpdateCallbacks.push(callback);
    // Retorna uma função para remover o callback
    return () => {
      this.playbackStatusUpdateCallbacks = this.playbackStatusUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  public removeOnPlaybackStatusUpdate(callbackToRemove: (status: PlaybackStatus) => void): void {
     this.playbackStatusUpdateCallbacks = this.playbackStatusUpdateCallbacks.filter(cb => cb !== callbackToRemove);
  }

  public getCurrentSong(): Song | null {
    if (this.currentIndexInPlayerQueue >= 0 && this.currentIndexInPlayerQueue < this.currentPlaylist.length) {
      // currentPlaylist reflete a ordem da fila do player (pode estar embaralhada)
      return this.currentPlaylist[this.currentIndexInPlayerQueue];
    }
    // Fallback se o índice estiver dessincronizado, tenta encontrar pelo ID na playlist original
    if (this.currentTrackPlayerId) {
        return this.originalPlaylistOrder.find(s => (s.id || s.path) === this.currentTrackPlayerId) || null;
    }
    return null;
  }
  
  public getCurrentPlaylistInternal(): Song[] {
    // Retorna a playlist na ordem em que está sendo tocada (pode ser embaralhada)
    return [...this.currentPlaylist];
  }

  public getOriginalPlaylistOrder(): Song[] {
    return [...this.originalPlaylistOrder];
  }

  public async getCurrentPlaybackStatus(): Promise<PlaybackStatus | null> {
    try {
      const stateResult = await TrackPlayer.getPlaybackState(); // Usa a versão que retorna um objeto
      const state = stateResult.state;
      const progress = await TrackPlayer.getProgress();
      const activeTrackIndex = await TrackPlayer.getActiveTrackIndex();
      let currentTrack: Track | null = null;
      if (activeTrackIndex !== undefined) {
        currentTrack = await TrackPlayer.getTrack(activeTrackIndex);
      }

      return {
        isPlaying: state === State.Playing,
        isLoaded: state !== State.None && state !== State.Stopped && state !== State.Error,
        isBuffering: state === State.Buffering || state === State.Connecting,
        durationMillis: (currentTrack?.duration ?? progress.duration ?? 0) * 1000,
        positionMillis: progress.position * 1000,
        uri: currentTrack?.url,
        currentTrackId: currentTrack?.id,
        didJustFinish: state === State.Ended,
      };
    } catch (e) {
      Logger.error("Erro ao buscar status de playback:", e);
      return { isLoaded: false, isPlaying: false, durationMillis: 0, positionMillis: 0 };
    }
  }

  public async setRepeatMode(mode: RepeatMode): Promise<void> {
    this.repeatMode = mode;
    Logger.info(`TrackPlayer Service: Modo de repetição definido para: ${mode}`);
    switch (mode) {
      case 'off': await TrackPlayer.setRepeatMode(TPRepeatMode.Off); break;
      case 'one': await TrackPlayer.setRepeatMode(TPRepeatMode.Track); break;
      case 'all': await TrackPlayer.setRepeatMode(TPRepeatMode.Queue); break;
    }
  }

  public async setShuffleMode(enabled: boolean): Promise<void> {
    const oldShuffleMode = this.shuffleMode;
    this.shuffleMode = enabled;
    Logger.info(`TrackPlayer Service: Modo aleatório ${enabled ? 'ativado' : 'desativado'}.`);

    if (oldShuffleMode !== enabled && this.originalPlaylistOrder.length > 0) {
        const currentSongPlaying = this.getCurrentSong(); // Pega a música que está tocando AGORA
        if (currentSongPlaying) {
            const songIndexInOriginal = this.originalPlaylistOrder.findIndex(s => (s.id || s.path) === (currentSongPlaying.id || currentSongPlaying.path));
            if (songIndexInOriginal !== -1) {
                // Reconstrói a fila com a nova configuração de shuffle, mantendo a música atual
                // Passa a originalPlaylistOrder para que o playAudio possa embaralhar/desembaralhar corretamente
                Logger.info(`Reconstruindo fila devido à mudança de shuffle. Música atual: ${currentSongPlaying.name}`);
                await this.playAudio(currentSongPlaying, this.originalPlaylistOrder, songIndexInOriginal);
            } else {
                 Logger.warn("Não foi possível encontrar a música atual na playlist original ao mudar shuffle.");
            }
        } else {
            Logger.info("Nenhuma música tocando, apenas alterando o estado do shuffle mode.");
        }
    }
  }

  public getRepeatMode = () => this.repeatMode;
  public getShuffleMode = () => this.shuffleMode;

  public async cleanup() {
    Logger.info("TrackPlayer Service: Limpando player.");
    // TrackPlayer.destroy() // Use com cuidado, pode precisar reconfigurar tudo.
    // Normalmente, TrackPlayer.reset() ou TrackPlayer.stop() são suficientes.
    AppState.removeEventListener('change', this.handleAppStateChange);
    // Remover todos os listeners de eventos do TrackPlayer se necessário,
    // mas geralmente são gerenciados pelo ciclo de vida do serviço.
  }
}