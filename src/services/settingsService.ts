import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

type UserSettingsRow = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

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

    if (!user) throw new Error('当前未登录，请先登录 Mirror AI 账号再保存配置');

    // 只提交本次真正要写的列：undefined 的字段不进 payload，避免把未提交的列
    // （如飞书 webhook）清成 null。旧写法 feishu_webhook + ...settings 会带进意外字段。
    const payload: UserSettingsInsert = {
      user_id: user.id,
      ...(settings.ai_api_key !== undefined && { ai_api_key: settings.ai_api_key }),
      ...(settings.ai_base_url !== undefined && { ai_base_url: settings.ai_base_url }),
      ...(settings.ai_model !== undefined && { ai_model: settings.ai_model }),
      ...(settings.feishu_webhook !== undefined && { feishu_webhook: settings.feishu_webhook }),
    };

    // onConflict 必须指定 user_id：表的唯一键是 user_id，主键是 id。
    // 不指定时 PostgREST 按 id 冲突处理，payload 又没带 id → 走 INSERT →
    // 撞上 user_id 唯一约束 → 保存失败。这是此前保存报错的根因。
    const { error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' });

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
