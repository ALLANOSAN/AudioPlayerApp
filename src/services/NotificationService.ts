import { AppState } from 'react-native';
import MusicControl, { Command } from 'react-native-music-control';
import { Audio } from 'expo-av';

export class NotificationService {
  private static instance: NotificationService;
  private areEventsRegistered: boolean = false;

  private constructor() {
    this.setupMusicControl();
    this.monitorAppState();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupMusicControl() {
    // Configuração básica do MusicControl
    MusicControl.enableBackgroundMode(true);
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', true);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('seek', true);
    MusicControl.enableControl('changePlaybackPosition', true);
    
    // Lidar com interrupções de áudio (chamadas recebidas, etc.)
    MusicControl.handleAudioInterruptions(true);
    
    this.registerPlaybackEvents();
  }

  private registerPlaybackEvents() {
    if (this.areEventsRegistered) {
      console.log('Os eventos de reprodução já foram registrados. Ignorando.');
      return;
    }

    try {
      // Registrar eventos do MusicControl usando o objeto Command
      MusicControl.on(Command.play, () => {
        // Será chamado quando o usuário pressionar o botão play na notificação
        this.onRemotePlay();
      });

      MusicControl.on(Command.pause, () => {
        // Será chamado quando o usuário pressionar o botão pause na notificação
        this.onRemotePause();
      });

      MusicControl.on(Command.stop, () => {
        // Será chamado quando o usuário pressionar o botão stop na notificação
        this.onRemoteStop();
      });

      MusicControl.on(Command.nextTrack, () => {
        // Será chamado quando o usuário pressionar o botão next na notificação
        this.onRemoteNext();
      });

      MusicControl.on(Command.previousTrack, () => {
        // Será chamado quando o usuário pressionar o botão previous na notificação
        this.onRemotePrevious();
      });

      MusicControl.on(Command.changePlaybackPosition, (position) => {
        // Será chamado quando o usuário mudar a posição na notificação
        this.onRemoteSeek(position);
      });

      // Adicione este para lidar com o fechamento da notificação (Android)
      MusicControl.on(Command.closeNotification, () => {
        // Limpar recursos quando a notificação for fechada
        this.resetNotification();
      });

      this.areEventsRegistered = true;
    } catch (error) {
      console.error('Erro ao registrar eventos de reprodução:', error);
    }
  }

  // Métodos para lidar com eventos remotos
  // Estes métodos serão implementados pelo componente Player
  private onRemotePlay: () => void = () => {};
  private onRemotePause: () => void = () => {};
  private onRemoteStop: () => void = () => {};
  private onRemoteNext: () => void = () => {};
  private onRemotePrevious: () => void = () => {};
  private onRemoteSeek: (position: number) => void = () => {};

  // Métodos para definir os callbacks
  public setOnRemotePlay(callback: () => void) {
    this.onRemotePlay = callback;
  }

  public setOnRemotePause(callback: () => void) {
    this.onRemotePause = callback;
  }

  public setOnRemoteStop(callback: () => void) {
    this.onRemoteStop = callback;
  }

  public setOnRemoteNext(callback: () => void) {
    this.onRemoteNext = callback;
  }

  public setOnRemotePrevious(callback: () => void) {
    this.onRemotePrevious = callback;
  }

  public setOnRemoteSeek(callback: (position: number) => void) {
    this.onRemoteSeek = callback;
  }

  private monitorAppState() {
    try {
      AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'background') {
          console.log('App em segundo plano, mantendo notificação ativa');
        } else if (nextAppState === 'active') {
          console.log('App em primeiro plano');
        }
      });
    } catch (error) {
      console.error('Erro ao monitorar estado do aplicativo:', error);
    }
  }

  async updateNotificationMetadata(title: string, artist: string, artwork?: string, duration?: number) {
    try {
      MusicControl.setNowPlaying({
        title: title,
        artist: artist,
        artwork: artwork || undefined, // Capa do álbum
        duration: duration || 0, // Duração em segundos
        elapsedTime: 0, // Posição inicial
        color: 0x000000, // Cor de fundo da notificação (opcional)
        isLiveStream: false, // Não é uma transmissão ao vivo
      });
    } catch (error) {
      console.error('Erro ao atualizar metadados da notificação:', error);
    }
  }

  async updatePlaybackState(isPlaying: boolean, position: number) {
    try {
      if (isPlaying) {
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING,
          elapsedTime: position,
        });
      } else {
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PAUSED,
          elapsedTime: position,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar estado de reprodução:', error);
    }
  }

  async resetNotification() {
    try {
      MusicControl.resetNowPlaying();
    } catch (error) {
      console.error('Erro ao resetar notificação:', error);
    }
  }
}
