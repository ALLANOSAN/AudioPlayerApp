import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../utils/logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
}

export class StorageService {
  private static instance: StorageService;
  private readonly DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas
  private readonly CACHE_PREFIX = 'audio_cache_';
  private readonly MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async cacheTrack<T>(trackId: string, data: T, expiryTime: number = this.DEFAULT_EXPIRY): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiryTime
      };

      await this.checkCacheSize();
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${trackId}`,
        JSON.stringify(cacheItem)
      );
      
      Logger.debug(`Track cached: ${trackId}`);
    } catch (error) {
      Logger.error('Error caching track:', error);
    }
  }

  async getCachedTrack<T>(trackId: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${trackId}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      if (this.isCacheExpired(cacheItem)) {
        await this.removeCachedTrack(trackId);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      Logger.error('Error getting cached track:', error);
      return null;
    }
  }

  private isCacheExpired(cacheItem: CacheItem<any>): boolean {
    return Date.now() - cacheItem.timestamp > cacheItem.expiryTime;
  }

  private async checkCacheSize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 100) { // Limite arbitrário de itens
        const oldestKeys = await this.getOldestCacheKeys(cacheKeys);
        await AsyncStorage.multiRemove(oldestKeys.slice(0, 20));
      }
    } catch (error) {
      Logger.error('Error checking cache size:', error);
    }
  }

  private async getOldestCacheKeys(keys: string[]): Promise<string[]> {
    const items = await Promise.all(
      keys.map(async key => {
        const value = await AsyncStorage.getItem(key);
        return { key, timestamp: JSON.parse(value!).timestamp };
      })
    );

    return items
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => item.key);
  }

  async removeCachedTrack(trackId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${trackId}`);
    } catch (error) {
      Logger.error('Error removing cached track:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      Logger.debug('Cache cleared');
    } catch (error) {
      Logger.error('Error clearing cache:', error);
    }
  }
}
