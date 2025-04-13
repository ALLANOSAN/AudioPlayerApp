import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { Logger } from '../utils/logger';
import { APP_STRINGS } from '../constants/strings';

const { MediaSessionModule } = NativeModules;
const mediaSessionEvents = new NativeEventEmitter(MediaSessionModule);

export class MediaSessionService {
  private static instance: MediaSessionService;
  private initialized: boolean = false;
  private eventListeners: any[] = [];
  private callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek?: (position: number) => void;
    onAudioFocusLost?: () => void;
    onAudioFocusGained?: () => void;
  } = {};
  private constructor() {}

  public static getInstance(): MediaSessionService {
    if (!MediaSessionService.instance) {
      MediaSessionService.instance = new MediaSessionService();
    }
    return MediaSessionService.instance;
  }

  public async setup(): Promise<void> {
    if (Platform.OS !== 'android') {
      Logger.info('MediaSession is only supported on Android');
      return;
    }

    try {
      if (!this.initialized) {
        await MediaSessionModule.setupMediaSession('AudioPlayerApp');
        this.registerEventListeners();
        this.initialized = true;
        Logger.info(APP_STRINGS.SUCCESS.NOTIFICATION_SETUP || 'MediaSession setup successfully');
      }
    } catch (error) {
      Logger.error(APP_STRINGS.ERRORS.NOTIFICATION_SETUP || 'Error setting up MediaSession', error);
      throw error;
    }
  }
  private registerEventListeners(): void {
    this.removeEventListeners();

    this.eventListeners = [
      mediaSessionEvents.addListener('onPlay', () => {
        if (this.callbacks.onPlay) this.callbacks.onPlay();
      }),
      mediaSessionEvents.addListener('onPause', () => {
        if (this.callbacks.onPause) this.callbacks.onPause();
      }),
      mediaSessionEvents.addListener('onStop', () => {
        if (this.callbacks.onStop) this.callbacks.onStop();
      }),
      mediaSessionEvents.addListener('onSkipToNext', () => {
        if (this.callbacks.onNext) this.callbacks.onNext();
      }),
      mediaSessionEvents.addListener('onSkipToPrevious', () => {
        if (this.callbacks.onPrevious) this.callbacks.onPrevious();
      }),
      mediaSessionEvents.addListener('onSeekTo', (data: { position: number }) => {
        if (this.callbacks.onSeek) this.callbacks.onSeek(data.position);
      }),
      mediaSessionEvents.addListener('onAudioFocusLost', () => {
        if (this.callbacks.onAudioFocusLost) this.callbacks.onAudioFocusLost();
      }),
      mediaSessionEvents.addListener('onAudioFocusGained', () => {
        if (this.callbacks.onAudioFocusGained) this.callbacks.onAudioFocusGained();
      })
    ];
  }
  private removeEventListeners(): void {
    this.eventListeners.forEach(listener => listener.remove());
    this.eventListeners = [];
  }

  public setCallbacks(callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    onSeek?: (position: number) => void;
    onAudioFocusLost?: () => void;
    onAudioFocusGained?: () => void;
  }): void {
    this.callbacks = callbacks;
  }

  public async updatePlaybackState(isPlaying: boolean, currentTime: number, duration: number): Promise<void> {
    if (!this.initialized || Platform.OS !== 'android') return;

    try {
      await MediaSessionModule.updatePlaybackState(isPlaying, currentTime, duration);
    } catch (error) {
      Logger.error('Error updating playback state', error);
    }
  }
  public async updateMetadata(songInfo: {
    title: string;
    artist: string;
    album?: string;
    artwork?: string;
    duration: number;
  }): Promise<void> {
    if (!this.initialized || Platform.OS !== 'android') return;

    try {
      await MediaSessionModule.updateMetadata(
        songInfo.title,
        songInfo.artist,
        songInfo.album || '',
        songInfo.artwork || '',
        songInfo.duration
      );
    } catch (error) {
      Logger.error('Error updating metadata', error);
    }
  }

  public async requestAudioFocus(): Promise<boolean> {
    if (!this.initialized || Platform.OS !== 'android') return true;

    try {
      return await MediaSessionModule.requestAudioFocus();
    } catch (error) {
      Logger.error('Error requesting audio focus', error);
      return false;
    }
  }
  public async abandonAudioFocus(): Promise<boolean> {
    if (!this.initialized || Platform.OS !== 'android') return true;

    try {
      return await MediaSessionModule.abandonAudioFocus();
    } catch (error) {
      Logger.error('Error abandoning audio focus', error);
      return false;
    }
  }

  public async resetSession(): Promise<void> {
    if (!this.initialized || Platform.OS !== 'android') return;

    try {
      this.removeEventListeners();
      await MediaSessionModule.resetSession();
      this.initialized = false;
    } catch (error) {
      Logger.error('Error resetting media session', error);
    }
  }
}
