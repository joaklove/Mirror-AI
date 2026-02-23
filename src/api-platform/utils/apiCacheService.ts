import { Request } from 'express';

const CACHE_STORAGE = 'mirror-ai-api-cache';
const DEFAULT_CACHE_TTL = 300000;
const MAX_CACHE_SIZE = 1000;

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class ApiCacheService {
  private cache: Map<string, CacheItem> = new Map();

  constructor() {
    this.loadCache();
    this.startCleanupInterval();
  }

  private loadCache(): void {
    try {
      const stored = localStorage.getItem(CACHE_STORAGE);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, item]) => {
          this.cache.set(key, item);
        });
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
      this.cache = new Map();
    }
  }

  private saveCache(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(CACHE_STORAGE, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.saveCache();
    }
  }

  private generateCacheKey(req: Request): string {
    const { method, originalUrl, query, body } = req;
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${originalUrl}:${queryString}:${bodyHash}`;
  }

  public async getCache(req: Request): Promise<any | null> {
    const key = this.generateCacheKey(req);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.saveCache();
      return null;
    }

    return item.data;
  }

  public async setCache(req: Request, data: any, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
    const key = this.generateCacheKey(req);

    if (this.cache.size >= MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    this.saveCache();
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  public clearCache(): void {
    this.cache.clear();
    this.saveCache();
  }

  public clearCacheByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    let cleared = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.saveCache();
    }
  }

  public getCacheStats(): {
    size: number;
    maxSize: number;
    defaultTtl: number;
    items: Array<{ key: string; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const items = Array.from(this.cache.entries())
      .map(([key, item]) => ({
        key,
        age: now - item.timestamp,
        ttl: item.ttl
      }))
      .slice(0, 50);

    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
      defaultTtl: DEFAULT_CACHE_TTL,
      items
    };
  }

  public invalidateCacheForEndpoint(endpoint: string): void {
    const pattern = `.*${endpoint}.*`;
    this.clearCacheByPattern(pattern);
  }
}

export const apiCacheService = new ApiCacheService();
