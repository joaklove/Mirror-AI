import { settingsService } from './settingsService';
import { PrivacySettings, DEFAULT_PRIVACY_SETTINGS } from '../types/privacy';
import type { Database } from '../integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';

type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

class PrivacyService {
  private encryptionKey: CryptoKey | null = null;

  async initialize(): Promise<void> {
    const storedKey = localStorage.getItem('encryptionKey');
    if (storedKey) {
      this.encryptionKey = await this.importKey(storedKey);
    } else {
      this.encryptionKey = await this.generateKey();
      const exported = await this.exportKey(this.encryptionKey);
      localStorage.setItem('encryptionKey', exported);
    }
  }

  private async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      encoder.encode(data)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    const settings = await settingsService.getSettings();
    if (settings && settings.privacy_settings) {
      return settings.privacy_settings as PrivacySettings;
    }
    return DEFAULT_PRIVACY_SETTINGS;
  }

  async savePrivacySettings(settings: PrivacySettings): Promise<void> {
    const settingsData = await settingsService.getSettings();
    await settingsService.updateSettings({
      ...settingsData,
      privacy_settings: settings
    });
  }

  async exportData(userId: string): Promise<Blob> {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );

    const { data: entries } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const settings = await this.getPrivacySettings();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      entries: entries || [],
      privacySettings: settings
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }

  async deleteAllData(userId: string): Promise<void> {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );

    await supabase.from('journal_entries').delete().eq('user_id', userId);
    await supabase.from('ai_reports').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    localStorage.removeItem('encryptionKey');
    this.encryptionKey = null;
  }

  isEncryptionEnabled(): boolean {
    const stored = localStorage.getItem('encryptionEnabled');
    return stored !== 'false';
  }

  setEncryptionEnabled(enabled: boolean): void {
    localStorage.setItem('encryptionEnabled', String(enabled));
  }
}

export const privacyService = new PrivacyService();
