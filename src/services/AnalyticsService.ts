import { init, track, identify, Identify, flush } from '@amplitude/analytics-react-native';
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
      await init(apiKey);
      this.initialized = true;
      Logger.debug('Analytics initialized');
    } catch (error) {
      Logger.error(`Analytics initialization failed: ${error}`);
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    if (!this.initialized) return;

    try {
      await track(eventName, {
        ...properties,
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Logger.error(`Error tracking event: ${error}`);
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
      const identifyObj = new Identify();
      Object.entries(properties).forEach(([key, value]) => {
        identifyObj.set(key, value);
      });
      await identify(identifyObj);
    } catch (error) {
      Logger.error(`Error setting user properties: ${error}`);
    }
  }

  async flush(): Promise<void> {
    if (!this.initialized) return;

    try {
      await flush();
      Logger.debug('Analytics events flushed');
    } catch (error) {
      Logger.error(`Error flushing analytics events: ${error}`);
    }
  }
}
