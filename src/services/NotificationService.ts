import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';
import { AppState } from 'react-native';

class NotificationService {
  private isSetup: boolean = false;
  private areEventsRegistered: boolean = false; // Flag para evitar duplicidade na inscrição de eventos

  /**
   * Configura o serviço de notificações para o player de música
   */
  async setup() {
    if (this.isSetup) return;

    try {
      // Configurar o TrackPlayer para exibir notificações
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });

      // Registrar eventos de reprodução (tanto para foreground quanto para background)
      this.registerPlaybackEvents();

      // Monitorar estado do aplicativo
      this.monitorAppState();

      this.isSetup = true;
      console.log('Serviço de notificações configurado com sucesso');
    } catch (error) {
      console.error('Erro ao configurar serviço de notificações:', error);
    }
  }

  /**
   * Registra os eventos de reprodução para atualizar as notificações
   */
  private registerPlaybackEvents() {
    if (this.areEventsRegistered) {
      console.log('Os eventos de reprodução já foram registrados. Ignorando.');
      return;
    }

    try {
      // Eventos de controle remoto e playback
      TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        await TrackPlayer.play();
      });

      TrackPlayer.addEventListener(Event.RemotePause, async () => {
        await TrackPlayer.pause();
      });

      TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        await TrackPlayer.stop();
      });

      TrackPlayer.addEventListener(Event.RemoteNext, async () => {
        await TrackPlayer.skipToNext();
      });

      TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
        await TrackPlayer.skipToPrevious();
      });

      TrackPlayer.addEventListener(Event.RemoteSeek, async (data) => {
        await TrackPlayer.seekTo(data.position);
      });

      // Evento para atualização de faixa
      TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
        if (data.nextTrack !== null && data.nextTrack !== undefined) {
          const track = await TrackPlayer.getTrack(data.nextTrack);
          if (track) {
            console.log('Notificação atualizada para:', track.title);
          }
        }
      });

      // Evento para mudança de estado de reprodução
      TrackPlayer.addEventListener(Event.PlaybackState, async () => {
        const state = await TrackPlayer.getState();

        if (state === State.Playing) {
          console.log('Notificação: Reproduzindo');
        } else if (state === State.Paused) {
          console.log('Notificação: Pausado');
        } else if (state === State.Stopped) {
          console.log('Notificação: Parado');
        }
      });

      // Registro de erros na reprodução
      TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
        console.error('Erro durante a reprodução:', error);
      });

      // Marcar como registrado
      this.areEventsRegistered = true;
      console.log('Eventos de reprodução registrados com sucesso.');
    } catch (error) {
      console.error('Erro ao registrar eventos de reprodução:', error);
    }
  }

  /**
   * Monitora o estado do aplicativo para gerenciar notificações
   * quando o app está em segundo plano
   */
  private monitorAppState() {
    try {
      AppState.addEventListener('change', async (nextAppState) => {
        if (nextAppState === 'background') {
          const playbackState = await TrackPlayer.getState();
          if (playbackState === State.Playing) {
            console.log('App em segundo plano, mantendo notificação ativa');
          }
        } else if (nextAppState === 'active') {
          console.log('App em primeiro plano');
        }
      });
    } catch (error) {
      console.error('Erro ao monitorar estado do aplicativo:', error);
    }
  }

  /**
   * Atualiza os metadados da notificação
   */
  async updateNotificationMetadata(title: string, artist: string, artwork?: string) {
    try {
      await TrackPlayer.updateNowPlayingMetadata({
        title,
        artist,
        artwork: artwork || undefined,
      });
    } catch (error) {
      console.error('Erro ao atualizar metadados da notificação:', error);
    }
  }
}

// Exportar uma instância única do serviço
export const notificationService = new NotificationService();
