import { Amplitude, Types } from '@amplitude/analytics-react-native';
import { Platform } from 'react-native';
import { Logger } from '../utils/logger';
import { AudioPlayer } from './AudioPlayer';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize(apiKey: string): Promise<void> {
    try {
      await Amplitude.init(apiKey);
      this.initialized = true;
      Logger.debug('Analytics initialized');
    } catch (error) {
      Logger.error('Error initializing analytics:', error);
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    if (!this.initialized) return;

    try {
      await Amplitude.track(eventName, {
        ...properties,
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Logger.error('Error tracking event:', error);
    }
  }

  async trackPlayback(action: 'play' | 'pause' | 'skip' | 'seek', songId: string): Promise<void> {
    await this.trackEvent('playback_action', {
      action,
      song_id: songId,
      position: await AudioPlayer.getInstance().getCurrentPosition()
    });
  }

  async trackError(error: Error, context: string): Promise<void> {
    await this.trackEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context
    });
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    if (!this.initialized) return;

    try {
      await Amplitude.setUserProperties(properties);
    } catch (error) {
      Logger.error('Error setting user properties:', error);
    }
  }
}
