import { supabase } from '@/integrations/supabase/client';
import type { JournalEntry } from './journalService';

interface SyncRecord {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncStatus {
  lastSync: number | null;
  pendingSyncs: number;
  isSyncing: boolean;
  error: string | null;
}

const SYNC_STORAGE_KEY = 'mirror-ai-sync-records';
const SYNC_STATUS_KEY = 'mirror-ai-sync-status';
const SYNC_INTERVAL = 1000; // 1 second
const MAX_SYNC_DELAY = 3000; // 3 seconds

class SyncService {
  private syncRecords: SyncRecord[] = [];
  private syncStatus: SyncStatus = {
    lastSync: null,
    pendingSyncs: 0,
    isSyncing: false,
    error: null,
  };
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadSyncRecords();
    this.loadSyncStatus();
    this.startSyncInterval();
  }

  private loadSyncRecords() {
    try {
      const stored = localStorage.getItem(SYNC_STORAGE_KEY);
      if (stored) {
        this.syncRecords = JSON.parse(stored);
        this.syncStatus.pendingSyncs = this.syncRecords.filter(r => !r.synced).length;
      }
    } catch (error) {
      console.error('Failed to load sync records:', error);
      this.syncRecords = [];
    }
  }

  private saveSyncRecords() {
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(this.syncRecords));
    } catch (error) {
      console.error('Failed to save sync records:', error);
    }
  }

  private loadSyncStatus() {
    try {
      const stored = localStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }

  private saveSyncStatus() {
    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save sync status:', error);
    }
  }

  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      this.syncPendingRecords();
    }, SYNC_INTERVAL);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  private async syncPendingRecords() {
    if (this.syncStatus.isSyncing || this.syncStatus.pendingSyncs === 0) {
      return;
    }

    try {
      this.syncStatus.isSyncing = true;
      this.syncStatus.error = null;
      this.saveSyncStatus();

      const pendingRecords = this.syncRecords.filter(r => !r.synced);
      
      for (const record of pendingRecords) {
        try {
          await this.processSyncRecord(record);
          record.synced = true;
          this.syncStatus.lastSync = Date.now();
        } catch (error) {
          console.error(`Failed to sync record ${record.id}:`, error);
          // If sync fails, keep the record pending
        }
      }

      // Remove old synced records (older than 24 hours)
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.syncRecords = [
        ...this.syncRecords.filter(r => !r.synced),
        ...this.syncRecords.filter(r => r.synced && r.timestamp > twentyFourHoursAgo)
      ];

      this.syncStatus.pendingSyncs = this.syncRecords.filter(r => !r.synced).length;
    } catch (error) {
      console.error('Sync process failed:', error);
      this.syncStatus.error = error instanceof Error ? error.message : 'Unknown sync error';
    } finally {
      this.syncStatus.isSyncing = false;
      this.saveSyncRecords();
      this.saveSyncStatus();
    }
  }

  private async processSyncRecord(record: SyncRecord) {
    const { type, data } = record;

    switch (type) {
      case 'create':
        if (data.type === 'journal') {
          const { error } = await supabase
            .from('journal_entries')
            .insert({
              id: data.id,
              content: data.content,
              mood: data.mood,
              tags: data.tags,
              dimension: data.dimension,
              user_id: data.user_id,
              created_at: data.created_at,
              updated_at: data.updated_at
            });
          if (error) throw error;
        }
        break;
      case 'update':
        if (data.type === 'journal') {
          const { error } = await supabase
            .from('journal_entries')
            .update({
              content: data.content,
              mood: data.mood,
              tags: data.tags,
              dimension: data.dimension,
              updated_at: data.updated_at
            })
            .eq('id', data.id)
            .eq('user_id', data.user_id);
          if (error) throw error;
        }
        break;
      case 'delete':
        if (data.type === 'journal') {
          const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', data.id)
            .eq('user_id', data.user_id);
          if (error) throw error;
        }
        break;
    }
  }

  // Public methods
  addSyncRecord(type: 'create' | 'update' | 'delete', data: any) {
    const record: SyncRecord = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    this.syncRecords.push(record);
    this.syncStatus.pendingSyncs++;
    this.saveSyncRecords();
    this.saveSyncStatus();

    // Trigger immediate sync
    this.syncPendingRecords();

    return record.id;
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  async syncNow() {
    await this.syncPendingRecords();
  }

  addSyncStatusListener(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Real-time subscription setup
  setupRealTimeSubscriptions() {
    // Listen for journal entry changes
    const { error: journalError } = supabase
      .channel('public:journal_entries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'journal_entries'
      }, (payload) => {
        console.log('Journal entry change:', payload);
        // Handle incoming changes from other clients
        this.handleIncomingChange(payload);
      })
      .subscribe();

    if (journalError) {
      console.error('Error setting up journal subscription:', journalError);
    }

    return {
      journalError
    };
  }

  private handleIncomingChange(payload: any) {
    // This method would handle changes coming from other clients
    // and update the local state accordingly
    console.log('Handling incoming change:', payload);
    // Implementation would depend on your state management
  }

  // Cleanup
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
  }
}

// Export a singleton instance
export const syncService = new SyncService();
export default syncService;