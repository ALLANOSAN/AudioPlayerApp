import { AppState } from 'react-native';
import MusicControl, { Command } from 'react-native-music-control';
import { Audio } from 'expo-av';
import { Logger } from '../utils/logger';
import { APP_STRINGS } from '../constants/strings';
import { PlayerConfig } from '../config/playerConfig';

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
    });

    MusicControl.on(Command.pause, () => {
      Logger.debug('Pause command received');
    });

    MusicControl.on(Command.stop, () => {
      Logger.debug('Stop command received');
    });

    MusicControl.on(Command.nextTrack, () => {
      Logger.debug('Next track command received');
    });

    MusicControl.on(Command.previousTrack, () => {
      Logger.debug('Previous track command received');
    });

    this.areEventsRegistered = true;
  }

  public updatePlaybackControls() {
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);
  }

  public updatePlaybackState(isPlaying: boolean, currentTime: number, duration: number) {
    MusicControl.updatePlayback({
      state: isPlaying ? MusicControl.STATE_PLAYING : MusicControl.STATE_PAUSED,
      elapsedTime: currentTime,
      duration: duration,
    });
  }

  public updateNotificationMetadata(
    title: string,
    artist: string,
    artwork: string,
    duration: number
  ) {
    MusicControl.setNowPlaying({
      title,
      artist,
      artwork,
      duration,
      description: '',
      color: 0xFFFFFF,
      notificationIcon: 'notification_icon',
    });
  }

  public resetNotification() {
    MusicControl.resetNowPlaying();
  }

  public async setup(): Promise<void> {
    try {
      this.setupMusicControl();
      this.registerPlaybackEvents();
      
      await Audio.setAudioModeAsync(PlayerConfig.audio);
      
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