import type { JournalEntry } from './journalService';

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: APIPermission[];
  createdAt: string;
  lastUsed: string | null;
}

export type APIPermission = 
  | 'read:entries'
  | 'write:entries'
  | 'read:analysis'
  | 'read:tags';

export interface APIRateLimit {
  requests: number;
  limit: number;
  resetAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimit?: APIRateLimit;
}

const API_KEYS_STORAGE = 'mirror-ai-api-keys';
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const apiService = {
  generateAPIKey(name: string, permissions: APIPermission[]): APIKey {
    const id = crypto.randomUUID();
    const key = `mra_${this.generateRandomKey(32)}`;
    
    const apiKey: APIKey = {
      id,
      name,
      key,
      permissions,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    
    this.saveAPIKey(apiKey);
    return apiKey;
  },

  generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  saveAPIKey(apiKey: APIKey): void {
    const keys = this.getAPIKeys();
    keys.push(apiKey);
    localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys));
  },

  getAPIKeys(): APIKey[] {
    const stored = localStorage.getItem(API_KEYS_STORAGE);
    return stored ? JSON.parse(stored) : [];
  },

  getAPIKey(keyId: string): APIKey | undefined {
    return this.getAPIKeys().find(k => k.id === keyId);
  },

  deleteAPIKey(keyId: string): void {
    const keys = this.getAPIKeys().filter(k => k.id !== keyId);
    localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(keys));
  },

  validateAPIKey(key: string): APIKey | null {
    const keys = this.getAPIKeys();
    return keys.find(k => k.key === key) || null;
  },

  checkRateLimit(keyId: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(keyId);
    
    if (!record || now > record.resetAt) {
      rateLimitStore.set(keyId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      return true;
    }
    
    if (record.count >= RATE_LIMIT_MAX) {
      return false;
    }
    
    record.count++;
    return true;
  },

  getRateLimit(keyId: string): APIRateLimit {
    const record = rateLimitStore.get(keyId) || { count: 0, resetAt: Date.now() + RATE_LIMIT_WINDOW };
    return {
      requests: record.count,
      limit: RATE_LIMIT_MAX,
      resetAt: new Date(record.resetAt).toISOString(),
    };
  },

  hasPermission(apiKey: APIKey, permission: APIPermission): boolean {
    return apiKey.permissions.includes(permission);
  },

  async handleAPIRequest(
    endpoint: string,
    method: string,
    apiKey: string,
    body?: unknown
  ): Promise<APIResponse<unknown>> {
    const key = this.validateAPIKey(apiKey);
    
    if (!key) {
      return { success: false, error: 'Invalid API key' };
    }
    
    if (!this.checkRateLimit(key.id)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded',
        rateLimit: this.getRateLimit(key.id),
      };
    }

    key.lastUsed = new Date().toISOString();
    this.saveAPIKey(key);

    try {
      let result: unknown;
      
      switch (endpoint) {
        case '/entries':
          if (!this.hasPermission(key, 'read:entries') && method === 'GET') {
            return { success: false, error: 'Insufficient permissions' };
          }
          result = await this.handleEntriesRequest(method, body);
          break;
          
        case '/analysis':
          if (!this.hasPermission(key, 'read:analysis')) {
            return { success: false, error: 'Insufficient permissions' };
          }
          result = await this.handleAnalysisRequest(method, body);
          break;
          
        case '/tags':
          if (!this.hasPermission(key, 'read:tags')) {
            return { success: false, error: 'Insufficient permissions' };
          }
          result = await this.handleTagsRequest(method, body);
          break;
          
        default:
          return { success: false, error: 'Unknown endpoint' };
      }
      
      return {
        success: true,
        data: result,
        rateLimit: this.getRateLimit(key.id),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async handleEntriesRequest(method: string, body?: unknown): Promise<unknown> {
    const { journalService } = await import('./journalService');
    
    switch (method) {
      case 'GET':
        return journalService.getEntries();
      case 'POST':
        return journalService.createEntry(body as Omit<JournalEntry, 'id' | 'user_id'>);
      default:
        throw new Error('Unsupported method');
    }
  },

  async handleAnalysisRequest(method: string, _body?: unknown): Promise<unknown> {
    const { journalService } = await import('./journalService');
    
    switch (method) {
      case 'GET':
        const entries = await journalService.getEntries();
        return {
          totalEntries: entries.length,
          dimensions: this.calculateDimensionStats(entries),
          tags: this.calculateTagStats(entries),
        };
      default:
        throw new Error('Unsupported method');
    }
  },

  async handleTagsRequest(method: string, _body?: unknown): Promise<unknown> {
    const { journalService } = await import('./journalService');
    
    switch (method) {
      case 'GET':
        const entries = await journalService.getEntries();
        const allTags = new Set<string>();
        entries.forEach(e => e.tags?.forEach(t => allTags.add(t)));
        return { tags: Array.from(allTags) };
      default:
        throw new Error('Unsupported method');
    }
  },

  calculateDimensionStats(entries: JournalEntry[]): Record<string, number> {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      if (e.dimension) {
        stats[e.dimension] = (stats[e.dimension] || 0) + 1;
      }
    });
    return stats;
  },

  calculateTagStats(entries: JournalEntry[]): Record<string, number> {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      e.tags?.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });
    return stats;
  },
};
