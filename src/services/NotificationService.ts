import TrackPlayer, { Capability, Event, State } from 'react-native-track-player';
import { AppState } from 'react-native';

class NotificationService {
  private isSetup: boolean = false;

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
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
        ],
      });

      // Registrar eventos do player
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
    try {
      // Evento quando uma música começa a tocar
      TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (data) => {
        if (data.nextTrack !== null && data.nextTrack !== undefined) {
          // Atualizar metadados da notificação com a nova música
          const track = await TrackPlayer.getTrack(data.nextTrack);
          if (track) {
            console.log('Notificação atualizada para:', track.title);
          }
        }
      });

      // Evento quando o estado de reprodução muda (play/pause)
      TrackPlayer.addEventListener(Event.PlaybackState, async (data) => {
        const state = data.state;

        if (state === State.Playing) {
          console.log('Notificação: Reproduzindo');
        } else if (state === State.Paused) {
          console.log('Notificação: Pausado');
        } else if (state === State.Stopped) {
          console.log('Notificação: Parado');
        }
      });
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
          // App foi para segundo plano
          const playbackState = await TrackPlayer.getState();
          if (playbackState === State.Playing) {
            console.log('App em segundo plano, mantendo notificação ativa');
          }
        } else if (nextAppState === 'active') {
          // App voltou para primeiro plano
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
