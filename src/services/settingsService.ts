import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];

export interface UserSettings {
  ai_api_key?: string | null;
  ai_base_url?: string | null;
  ai_model?: string | null;
  feishu_webhook?: string | null;
  privacy_settings?: Record<string, unknown>;
}

class SettingsService {
  async getSettings(): Promise<UserSettings | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in getSettings:', error);
      return null;
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      ai_api_key: settings.ai_api_key,
      ai_base_url: settings.ai_base_url,
      ai_model: settings.ai_model,
      feishu_webhook: settings.feishu_webhook,
      ...settings,
    });

    if (error) throw error;
  }

  async getAIApiKey(): Promise<string | null> {
    const settings = await this.getSettings();
    return settings?.ai_api_key || null;
  }

  async setAIApiKey(apiKey: string): Promise<void> {
    await this.updateSettings({ ai_api_key: apiKey });
  }

  async getPrivacySettings(): Promise<Record<string, unknown> | null> {
    const settings = await this.getSettings();
    return settings?.privacy_settings || null;
  }

  async setPrivacySettings(privacySettings: Record<string, unknown>): Promise<void> {
    await this.updateSettings({ privacy_settings: privacySettings });
  }
}

export const settingsService = new SettingsService();
