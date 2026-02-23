import type { JournalEntry } from './journalService';

interface OfflineData {
  journalEntries: JournalEntry[];
  tags: string[];
  settings: Record<string, any>;
  lastUpdated: number;
}

interface OfflineStatus {
  isOffline: boolean;
  lastSync: number | null;
  offlineDataSize: number;
  error: string | null;
}

const OFFLINE_STORAGE_KEY = 'mirror-ai-offline-data';
const OFFLINE_STATUS_KEY = 'mirror-ai-offline-status';
const OFFLINE_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_OFFLINE_DATA_SIZE = 10000000; // 10MB

class OfflineService {
  private offlineData: OfflineData = {
    journalEntries: [],
    tags: [],
    settings: {},
    lastUpdated: Date.now(),
  };
  private offlineStatus: OfflineStatus = {
    isOffline: !navigator.onLine,
    lastSync: null,
    offlineDataSize: 0,
    error: null,
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadOfflineData();
    this.loadOfflineStatus();
    this.setupNetworkListeners();
    this.calculateOfflineDataSize();
  }

  private loadOfflineData() {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        this.offlineData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
      this.offlineData = {
        journalEntries: [],
        tags: [],
        settings: {},
        lastUpdated: Date.now(),
      };
    }
  }

  private saveOfflineData() {
    try {
      this.offlineData.lastUpdated = Date.now();
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(this.offlineData));
      this.calculateOfflineDataSize();
    } catch (error) {
      console.error('Failed to save offline data:', error);
      this.offlineStatus.error = error instanceof Error ? error.message : 'Failed to save offline data';
    }
  }

  private loadOfflineStatus() {
    try {
      const stored = localStorage.getItem(OFFLINE_STATUS_KEY);
      if (stored) {
        this.offlineStatus = { ...this.offlineStatus, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load offline status:', error);
    }
  }

  private saveOfflineStatus() {
    try {
      localStorage.setItem(OFFLINE_STATUS_KEY, JSON.stringify(this.offlineStatus));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save offline status:', error);
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.offlineStatus.isOffline = false;
      this.saveOfflineStatus();
      this.syncWithServer();
    });

    window.addEventListener('offline', () => {
      this.offlineStatus.isOffline = true;
      this.saveOfflineStatus();
    });
  }

  private calculateOfflineDataSize() {
    try {
      const dataString = JSON.stringify(this.offlineData);
      this.offlineStatus.offlineDataSize = new Blob([dataString]).size;
    } catch (error) {
      console.error('Failed to calculate offline data size:', error);
      this.offlineStatus.offlineDataSize = 0;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  private async syncWithServer() {
    // This method would sync offline data with the server
    // when network connection is restored
    console.log('Syncing offline data with server...');
    // Implementation would depend on your server sync logic
  }

  private cleanupOldData() {
    // Remove old journal entries if data size exceeds limit
    if (this.offlineStatus.offlineDataSize > MAX_OFFLINE_DATA_SIZE) {
      console.log('Cleaning up old offline data...');
      // Keep only the most recent 100 entries
      if (this.offlineData.journalEntries.length > 100) {
        this.offlineData.journalEntries = this.offlineData.journalEntries
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 100);
        this.saveOfflineData();
      }
    }
  }

  // Public methods
  getOfflineStatus(): OfflineStatus {
    return { ...this.offlineStatus };
  }

  isOffline(): boolean {
    return this.offlineStatus.isOffline;
  }

  // Journal entries methods
  getJournalEntries(): JournalEntry[] {
    return [...this.offlineData.journalEntries];
  }

  getJournalEntry(id: string): JournalEntry | undefined {
    return this.offlineData.journalEntries.find(entry => entry.id === id);
  }

  saveJournalEntry(entry: JournalEntry) {
    const existingIndex = this.offlineData.journalEntries.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      this.offlineData.journalEntries[existingIndex] = entry;
    } else {
      this.offlineData.journalEntries.push(entry);
    }

    this.saveOfflineData();
    this.cleanupOldData();
    return entry;
  }

  deleteJournalEntry(id: string) {
    this.offlineData.journalEntries = this.offlineData.journalEntries.filter(e => e.id !== id);
    this.saveOfflineData();
  }

  // Tags methods
  getTags(): string[] {
    return [...this.offlineData.tags];
  }

  saveTags(tags: string[]) {
    this.offlineData.tags = tags;
    this.saveOfflineData();
  }

  addTag(tag: string) {
    if (!this.offlineData.tags.includes(tag)) {
      this.offlineData.tags.push(tag);
      this.saveOfflineData();
    }
  }

  removeTag(tag: string) {
    this.offlineData.tags = this.offlineData.tags.filter(t => t !== tag);
    this.saveOfflineData();
  }

  // Settings methods
  getSettings(): Record<string, any> {
    return { ...this.offlineData.settings };
  }

  getSetting(key: string, defaultValue: any = null): any {
    return this.offlineData.settings[key] ?? defaultValue;
  }

  saveSetting(key: string, value: any) {
    this.offlineData.settings[key] = value;
    this.saveOfflineData();
  }

  saveSettings(settings: Record<string, any>) {
    this.offlineData.settings = { ...this.offlineData.settings, ...settings };
    this.saveOfflineData();
  }

  // Sync methods
  async syncNow() {
    if (!this.offlineStatus.isOffline) {
      await this.syncWithServer();
    }
  }

  // Listener methods
  addOfflineStatusListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Data management
  clearOfflineData() {
    this.offlineData = {
      journalEntries: [],
      tags: [],
      settings: {},
      lastUpdated: Date.now(),
    };
    this.saveOfflineData();
  }

  exportOfflineData(): OfflineData {
    return { ...this.offlineData };
  }

  importOfflineData(data: OfflineData) {
    this.offlineData = {
      ...data,
      lastUpdated: Date.now(),
    };
    this.saveOfflineData();
    this.calculateOfflineDataSize();
  }

  // Health check
  checkOfflineDataHealth(): boolean {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!stored) {
        return false;
      }
      const parsed = JSON.parse(stored);
      return (
        Array.isArray(parsed.journalEntries) &&
        Array.isArray(parsed.tags) &&
        typeof parsed.settings === 'object' &&
        typeof parsed.lastUpdated === 'number'
      );
    } catch (error) {
      console.error('Offline data health check failed:', error);
      return false;
    }
  }

  // Recovery
  repairOfflineData() {
    if (!this.checkOfflineDataHealth()) {
      console.log('Repairing offline data...');
      this.offlineData = {
        journalEntries: [],
        tags: [],
        settings: {},
        lastUpdated: Date.now(),
      };
      this.saveOfflineData();
      return true;
    }
    return false;
  }
}

// Export a singleton instance
export const offlineService = new OfflineService();
export default offlineService;