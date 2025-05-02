import { AppState } from 'react-native';
import MusicControl, { Command } from 'react-native-music-control';
import { Audio } from 'expo-av';
import { Logger } from '../utils/logger';
import { APP_STRINGS } from '../constants/strings';
import { PlayerConfig } from '../config/playerConfig';
import { MediaSessionService } from './MediaSessionService';

export class NotificationService {
  private static instance: NotificationService;
  private areEventsRegistered: boolean = false;
  private mediaSessionService: MediaSessionService;

  private constructor() {
    this.mediaSessionService = MediaSessionService.getInstance();
    this.setupMusicControl();
    this.monitorAppState();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private monitorAppState() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        this.updatePlaybackControls();
      }
    });
  }

  private registerPlaybackEvents() {
    if (this.areEventsRegistered) return;

    MusicControl.on(Command.play, () => {
      Logger.debug('Play command received');
      this.mediaSessionService.callbacks.onPlay?.();
    });

    MusicControl.on(Command.pause, () => {
      Logger.debug('Pause command received');
      this.mediaSessionService.callbacks.onPause?.();
    });

    MusicControl.on(Command.stop, () => {
      Logger.debug('Stop command received');
      this.mediaSessionService.callbacks.onStop?.();
    });

    MusicControl.on(Command.nextTrack, () => {
      Logger.debug('Next track command received');
      this.mediaSessionService.callbacks.onNext?.();
    });

    MusicControl.on(Command.previousTrack, () => {
      Logger.debug('Previous track command received');
      this.mediaSessionService.callbacks.onPrevious?.();
    });

    MusicControl.on(Command.seek, (position: number) => {
      Logger.debug('Seek command received', position);
      this.mediaSessionService.callbacks.onSeek?.(position);
    });

    this.areEventsRegistered = true;
  }

  public updatePlaybackControls() {
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);
    this.mediaSessionService.requestAudioFocus();
  }

  public updatePlaybackState(isPlaying: boolean, currentTime: number, duration: number) {
    MusicControl.updatePlayback({
      state: isPlaying ? MusicControl.STATE_PLAYING : MusicControl.STATE_PAUSED,
      elapsedTime: currentTime,
      duration: duration,
    });

    this.mediaSessionService.updatePlaybackState(isPlaying, currentTime, duration);
  }

  public updateMetadata(songInfo: {
    title: string;
    artist: string;
    artwork: string;
    duration: number;
  }) {
    MusicControl.setNowPlaying({
      title: songInfo.title,
      artist: songInfo.artist,
      artwork: songInfo.artwork,
      duration: songInfo.duration,
      description: '',
      color: 0xFFFFFF,
      notificationIcon: 'notification_icon',
    });

    this.mediaSessionService.updateMetadata({
      title: songInfo.title,
      artist: songInfo.artist,
      artwork: songInfo.artwork,
      duration: songInfo.duration
    });
  }

  public resetNotificationControls() {
    MusicControl.resetNowPlaying();
    this.mediaSessionService.resetSession();
  }

  public async setup(): Promise<void> {
    try {
      this.setupMusicControl();
      this.registerPlaybackEvents();

      await Audio.setAudioModeAsync(PlayerConfig.audio);
      await this.mediaSessionService.setup();

      Logger.info(APP_STRINGS.SUCCESS.NOTIFICATION_SETUP);
    } catch (error) {
      Logger.error(APP_STRINGS.ERRORS.NOTIFICATION_SETUP, error);
      throw error;
    }
  }

  private setupMusicControl() {
    const { controls } = PlayerConfig;
    MusicControl.enableBackgroundMode(controls.backgroundMode);
    Object.entries(controls.enabled).forEach(([control, enabled]) => {
      MusicControl.enableControl(control, enabled);
    });
  }
}
