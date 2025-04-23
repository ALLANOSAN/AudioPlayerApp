import { Audio } from 'expo-av';
import { NotificationService } from './NotificationService';
import { store as defaultStore } from '../store';
import { setCurrentSong, setIsPlaying } from '../store/playerSlice';
import { Song } from '../types/music';

export class AudioPlayer {
  private static instance: AudioPlayer;
  private sound: Audio.Sound;
  private notificationService: NotificationService;
  private store: any;
  private playbackStatusCallback?: (status: any) => void;
  private repeatMode: 'off' | 'one' | 'all' = 'off';
  private shuffleMode: boolean = false;

  private constructor(store: any = defaultStore) {
    this.sound = new Audio.Sound();
    this.notificationService = NotificationService.getInstance();
    this.store = store;
  }

  public static getInstance(store?: any): AudioPlayer {
    if (!AudioPlayer.instance || store) {
      AudioPlayer.instance = new AudioPlayer(store || defaultStore);
    }
    return AudioPlayer.instance;
  }

  async playAudio(uri: string, title?: string, artist?: string, artwork?: string) {
    try {
      await this.sound.unloadAsync();
      await this.sound.loadAsync({ uri });

      this.sound.setOnPlaybackStatusUpdate((status) => {
        if (this.playbackStatusCallback) {
          this.playbackStatusCallback(status);
        }
        if (status.isLoaded) {
          const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
          this.notificationService.updatePlaybackState(
            status.isPlaying,
            status.positionMillis / 1000,
            duration
          );
        }
      });

      if (title && artist) {
        const status = await this.sound.getStatusAsync();
        const duration = status.isLoaded && status.durationMillis ? status.durationMillis / 1000 : 0;

        // Use updateMetadata, não updateNotificationMetadata
        this.notificationService.updateMetadata({
          title,
          artist,
          artwork: artwork || '',
          duration
        });
      }

      await this.sound.playAsync();
      this.store.dispatch(setIsPlaying(true));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  async pauseAudio() {
    try {
      await this.sound.pauseAsync();
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
        this.notificationService.updatePlaybackState(
          false,
          status.positionMillis / 1000,
          duration
        );
      }
      this.store.dispatch(setIsPlaying(false));
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }

  async resumeAudio() {
    try {
      await this.sound.playAsync();
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
        this.notificationService.updatePlaybackState(
          true,
          status.positionMillis / 1000,
          duration
        );
      }
      this.store.dispatch(setIsPlaying(true));
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }

  async stopAudio() {
    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.notificationService.resetNotificationControls();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }

  async seekTo(positionSeconds: number) {
    try {
      await this.sound.setPositionAsync(positionSeconds * 1000);
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        const duration = status.durationMillis ? status.durationMillis / 1000 : 0;
        this.notificationService.updatePlaybackState(
          status.isPlaying,
          positionSeconds,
          duration
        );
      }
    } catch (error) {
      console.error('Error seeking position:', error);
    }
  }

  async getCurrentPosition(): Promise<number> {
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        return status.positionMillis / 1000;
      }
      return 0;
    } catch (error) {
      console.error('Error getting current position:', error);
      return 0;
    }
  }

  async nextTrack() {
    const currentSong = this.store.getState().player.currentSong;
    const playlist = this.store.getState().playlist.songs;

    const currentIndex = playlist.findIndex((song: Song) => song.id === currentSong?.id);
    if (currentIndex < playlist.length - 1) {
      const nextSong = playlist[currentIndex + 1];
      this.store.dispatch(setCurrentSong(nextSong));
      await this.playAudio(
        nextSong.url,
        nextSong.title,
        nextSong.artist,
        nextSong.artwork
      );
    }
  }

  async previousTrack() {
    const currentSong = this.store.getState().player.currentSong;
    const playlist = this.store.getState().playlist.songs;

    const currentIndex = playlist.findIndex((song: Song) => song.id === currentSong?.id);
    if (currentIndex > 0) {
      const previousSong = playlist[currentIndex - 1];
      this.store.dispatch(setCurrentSong(previousSong));
      await this.playAudio(
        previousSong.url,
        previousSong.title,
        previousSong.artist,
        previousSong.artwork
      );
    }
  }

  // === MÉTODOS ADICIONAIS PARA SUPORTE AO PLAYERSCREEN ===

  public setOnPlaybackStatusUpdate(callback: (status: any) => void) {
    this.playbackStatusCallback = callback;
    if (this.sound && this.sound.setOnPlaybackStatusUpdate) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  public removeAllListeners() {
    this.playbackStatusCallback = undefined;
    if (this.sound && this.sound.setOnPlaybackStatusUpdate) {
      this.sound.setOnPlaybackStatusUpdate(null);
    }
  }

  public setRepeatMode(mode: 'off' | 'one' | 'all') {
    this.repeatMode = mode;
    // Implemente lógica de repetição se necessário
  }

  public setShuffleMode(enabled: boolean) {
    this.shuffleMode = enabled;
    // Implemente lógica de shuffle se necessário
  }
}