import { supabase } from '@/integrations/supabase/client';

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  user_id?: string;
}

export const journalService = {
  // Get all journal entries for current user
  async getEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((entry) => ({
      id: entry.id,
      content: entry.content,
      timestamp: entry.created_at,
      tags: entry.tags || [],
      user_id: entry.user_id,
    }));
  },

  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'user_id'>): Promise<JournalEntry> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content: entry.content,
        tags: entry.tags,
        created_at: entry.timestamp,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      timestamp: data.created_at,
      tags: data.tags || [],
      user_id: data.user_id,
    };
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);

    if (error) throw error;
  },

  // Batch import entries (for migration)
  async batchImport(entries: JournalEntry[]): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const records = entries.map((entry) => ({
      user_id: user.id,
      content: entry.content,
      tags: entry.tags,
      created_at: entry.timestamp,
    }));

    const { error } = await supabase.from('journal_entries').insert(records);

    if (error) throw error;
  },

  // Get entries from last N hours
  getRecentEntries(entries: JournalEntry[], hours: number = 24): JournalEntry[] {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return entries.filter((entry) => new Date(entry.timestamp).getTime() > cutoffTime);
  },
};

export const settingsService = {
  // Get user settings
  async getSettings() {
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

      return data
        ? {
            apiKey: data.ai_api_key || '',
            baseUrl: data.ai_base_url || 'https://openrouter.ai/api/v1',
            model: data.ai_model || 'deepseek/deepseek-chat',
            feishuWebhook: data.feishu_webhook || '',
          }
        : null;
    } catch (error) {
      console.error('Error in getSettings:', error);
      return null;
    }
  },

  // Save user settings
  async saveSettings(settings: { apiKey: string; baseUrl: string; model: string; feishuWebhook?: string }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      ai_api_key: settings.apiKey,
      ai_base_url: settings.baseUrl,
      ai_model: settings.model,
      feishu_webhook: settings.feishuWebhook,
    });

    if (error) throw error;
  },
};

export const reportsService = {
  // Save AI report
  async saveReport(content: string, model: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('ai_reports').insert({
      user_id: user.id,
      content,
      model,
    });

    if (error) throw error;
  },

  // Get recent reports
  async getReports(limit: number = 10) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getReports:', error);
      return [];
    }
  },
};
