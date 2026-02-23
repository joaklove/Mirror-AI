import { supabase } from '@/integrations/supabase/client';
import { syncService } from './syncService';
import { offlineService } from './offlineService';

export type Dimension = 'psychology' | 'cognitive' | 'efficiency' | 'social' | 'health' | 'finance';

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  user_id?: string;
  dimension?: Dimension;
  emotion?: string;
  images?: string[];
}

export const journalService = {
  // Get all journal entries for current user
  async getEntries(): Promise<JournalEntry[]> {
    try {
      if (offlineService.isOffline()) {
        console.log('[JournalService] Getting entries from offline storage');
        const offlineEntries = offlineService.getJournalEntries();
        return offlineEntries.map(entry => ({
          id: entry.id,
          content: entry.content,
          timestamp: entry.created_at || entry.timestamp,
          tags: entry.tags || [],
          user_id: entry.user_id,
          images: entry.images || [],
        }));
      }

      console.log('[JournalService] Getting entries from Supabase');
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entries = (data || []).map((entry) => ({
        id: entry.id,
        content: entry.content,
        timestamp: entry.created_at,
        tags: entry.tags || [],
        user_id: entry.user_id,
        images: entry.images || [],
      }));

      // Save entries to offline storage
      entries.forEach(entry => {
        offlineService.saveJournalEntry({
          ...entry,
          created_at: entry.timestamp,
        });
      });

      return entries;
    } catch (error) {
      console.error('[JournalService] Error getting entries:', error);
      // Fallback to offline storage if Supabase fails
      const offlineEntries = offlineService.getJournalEntries();
      return offlineEntries.map(entry => ({
        id: entry.id,
        content: entry.content,
        timestamp: entry.created_at || entry.timestamp,
        tags: entry.tags || [],
        user_id: entry.user_id,
        images: entry.images || [],
      }));
    }
  },

  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'user_id'>): Promise<JournalEntry> {
    console.log('[JournalService] Creating entry...', { content: entry.content?.slice(0, 50), images: entry.images?.length });
    
    let user;
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data.user;
      console.log('[JournalService] User:', user?.id);
    } catch (error) {
      console.warn('[JournalService] Auth error (offline?):', error);
      // If auth fails, we'll still create the entry offline
    }
    
    if (offlineService.isOffline() || !user) {
      console.log('[JournalService] Creating entry in offline storage');
      const offlineEntry = {
        id: crypto.randomUUID(),
        content: entry.content,
        created_at: entry.timestamp,
        timestamp: entry.timestamp,
        tags: entry.tags || [],
        user_id: user?.id,
        images: entry.images || [],
        dimension: entry.dimension, // 保存 dimension 字段
      };

      // Save to offline storage
      offlineService.saveJournalEntry(offlineEntry);

      // Add to sync queue
      if (user) {
        syncService.addSyncRecord('create', {
          type: 'journal',
          ...offlineEntry,
        });
      }

      return {
        id: offlineEntry.id,
        content: offlineEntry.content,
        timestamp: offlineEntry.timestamp,
        tags: offlineEntry.tags,
        user_id: offlineEntry.user_id,
        images: offlineEntry.images,
        dimension: offlineEntry.dimension,
      };
    }

    console.log('[JournalService] Creating entry in Supabase');
    const insertData: any = {
      user_id: user.id,
      content: entry.content,
      tags: entry.tags,
      created_at: entry.timestamp,
    };

    // 保存 dimension 字段
    if (entry.dimension) {
      insertData.dimension = entry.dimension;
    }

    // Only include images if provided
    if (entry.images && entry.images.length > 0) {
      insertData.images = entry.images;
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[JournalService] Insert error:', error);
      // If error is about missing images column, retry without images
      if (error.message.includes('images') && error.message.includes('column')) {
        console.warn('[JournalService] Images column not found, retrying without images...');
        const { data: retryData, error: retryError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            content: entry.content,
            tags: entry.tags,
            created_at: entry.timestamp,
          })
          .select()
          .single();
        
        if (retryError) {
          console.error('[JournalService] Retry error:', retryError);
          // Fallback to offline storage
          const offlineEntry = {
            id: crypto.randomUUID(),
            content: entry.content,
            created_at: entry.timestamp,
            timestamp: entry.timestamp,
            tags: entry.tags || [],
            user_id: user.id,
            images: [],
          };
          offlineService.saveJournalEntry(offlineEntry);
          syncService.addSyncRecord('create', {
            type: 'journal',
            ...offlineEntry,
          });
          return offlineEntry;
        }
        
        console.log('[JournalService] Insert success (without images):', retryData.id);
        
        const resultEntry = {
          id: retryData.id,
          content: retryData.content,
          timestamp: retryData.created_at,
          tags: retryData.tags || [],
          user_id: retryData.user_id,
          images: [],
        };

        // Save to offline storage
        offlineService.saveJournalEntry({
          ...resultEntry,
          created_at: resultEntry.timestamp,
        });

        return resultEntry;
      }
      
      // Fallback to offline storage for any other error
      console.warn('[JournalService] Supabase error, falling back to offline storage:', error);
      const offlineEntry = {
        id: crypto.randomUUID(),
        content: entry.content,
        created_at: entry.timestamp,
        timestamp: entry.timestamp,
        tags: entry.tags || [],
        user_id: user.id,
        images: entry.images || [],
      };
      offlineService.saveJournalEntry(offlineEntry);
      syncService.addSyncRecord('create', {
        type: 'journal',
        ...offlineEntry,
      });
      return offlineEntry;
    }
    
    console.log('[JournalService] Insert success:', data.id);

    const resultEntry = {
      id: data.id,
      content: data.content,
      timestamp: data.created_at,
      tags: data.tags || [],
      user_id: data.user_id,
      images: data.images || [],
    };

    // Save to offline storage
    offlineService.saveJournalEntry({
      ...resultEntry,
      created_at: resultEntry.timestamp,
    });

    return resultEntry;
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    try {
      if (offlineService.isOffline()) {
        console.log('[JournalService] Deleting entry from offline storage');
        offlineService.deleteJournalEntry(id);

        // Add to sync queue
        const entry = offlineService.getJournalEntry(id);
        if (entry && entry.user_id) {
          syncService.addSyncRecord('delete', {
            type: 'journal',
            id: entry.id,
            user_id: entry.user_id,
          });
        }
        return;
      }

      console.log('[JournalService] Deleting entry from Supabase');
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);

      if (error) throw error;

      // Also delete from offline storage
      offlineService.deleteJournalEntry(id);
    } catch (error) {
      console.error('[JournalService] Delete error:', error);
      // Fallback to offline storage
      console.warn('[JournalService] Supabase error, falling back to offline storage:', error);
      offlineService.deleteJournalEntry(id);

      // Add to sync queue
      const entry = offlineService.getJournalEntry(id);
      if (entry && entry.user_id) {
        syncService.addSyncRecord('delete', {
          type: 'journal',
          id: entry.id,
          user_id: entry.user_id,
        });
      }
    }
  },

  // Batch import entries (for migration)
  async batchImport(entries: JournalEntry[]): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const records = entries.map((entry) => {
      const record: any = {
        user_id: user.id,
        content: entry.content,
        tags: entry.tags,
        created_at: entry.timestamp,
      };

      // Only include images if provided
      if (entry.images && entry.images.length > 0) {
        record.images = entry.images;
      }

      return record;
    });

    try {
      const { error } = await supabase.from('journal_entries').insert(records);
      if (error) throw error;
    } catch (error: any) {
      console.error('[JournalService] Batch import error:', error);
      // If error is about missing images column, retry without images
      if (error.message.includes('images') && error.message.includes('column')) {
        console.warn('[JournalService] Images column not found, retrying without images...');
        const recordsWithoutImages = entries.map((entry) => ({
          user_id: user.id,
          content: entry.content,
          tags: entry.tags,
          created_at: entry.timestamp,
        }));
        
        const { error: retryError } = await supabase.from('journal_entries').insert(recordsWithoutImages);
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }
  },

  // Get entries from last N hours
  getRecentEntries(entries: JournalEntry[], hours: number = 24): JournalEntry[] {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return entries.filter((entry) => new Date(entry.timestamp).getTime() > cutoffTime);
  },

  // Upload image to storage
  async uploadImage(file: File): Promise<string> {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[JournalService] Auth error:', authError);
        throw new Error('Authentication failed');
      }
      
      if (!user || !user.id) {
        console.error('[JournalService] User not found:', { user });
        throw new Error('User not authenticated');
      }

      console.log('[JournalService] User authenticated:', { userId: user.id });

      // Compress image if it's larger than 5MB
      let uploadFile = file;
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      
      if (file.size > MAX_SIZE && typeof document !== 'undefined') {
        console.log('[JournalService] Compressing image...', { originalSize: file.size, type: file.type });
        try {
          uploadFile = await this.compressImage(file, MAX_SIZE);
          console.log('[JournalService] Image compressed:', { newSize: uploadFile.size });
        } catch (error) {
          console.warn('[JournalService] Compression failed, using original file:', error);
          // If compression fails, use original file
        }
      }

      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      console.log('[JournalService] Uploading file:', { fileName, size: uploadFile.size, type: uploadFile.type });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('journal-images')
        .upload(fileName, uploadFile);

      if (uploadError) {
        console.error('[JournalService] Upload error:', uploadError);
        throw uploadError;
      }

      console.log('[JournalService] Upload success:', uploadData);

      const { data: urlData } = supabase.storage.from('journal-images').getPublicUrl(fileName);
      console.log('[JournalService] Got public URL:', urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('[JournalService] Upload image error:', error);
      throw error;
    }
  },

  // Compress image to specified size
  async compressImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document not available'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Handle CORS for images
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Calculate target dimensions (maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        
        // Resize if image is very large
        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx?.drawImage(img, 0, 0, width, height);

        // Binary search for optimal quality
        let quality = 0.9;
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let attempts = 0;
        const maxAttempts = 10;

        const compress = () => {
          // For PNG, quality parameter is ignored, so use lower quality for JPEG
          const targetType = file.type === 'image/png' ? 'image/jpeg' : file.type;
          const targetQuality = file.type === 'image/png' ? 0.8 : quality;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              attempts++;
              
              if (blob.size <= maxSize || attempts >= maxAttempts) {
                // Create new file with compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: blob.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Adjust quality and try again
                maxQuality = quality;
                quality = (minQuality + maxQuality) / 2;
                compress();
              }
            },
            targetType,
            targetQuality
          );
        };

        compress();
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Delete image from storage
  async deleteImage(imageUrl: string): Promise<void> {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts.slice(-2).join('/');

    const { error } = await supabase.storage
      .from('journal-images')
      .remove([fileName]);

    if (error) throw error;
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
            openaiApiKey: data.openai_api_key || '',
            anthropicApiKey: data.anthropic_api_key || '',
            googleApiKey: data.google_api_key || '',
            baseUrl: data.ai_base_url || 'https://openrouter.ai/api/v1',
            model: data.ai_model || 'deepseek/deepseek-chat',
            defaultModel: data.default_model || 'gpt-4o',
            modelConfigs: data.model_configs ? JSON.parse(data.model_configs) : {},
            feishuWebhook: data.feishu_webhook || '',
          }
        : null;
    } catch (error) {
      console.error('Error in getSettings:', error);
      return null;
    }
  },

  // Save user settings
  async saveSettings(settings: { 
    apiKey?: string; 
    openaiApiKey?: string;
    anthropicApiKey?: string;
    googleApiKey?: string;
    baseUrl?: string; 
    model?: string; 
    defaultModel?: string;
    modelConfigs?: Record<string, any>;
    feishuWebhook?: string 
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      ai_api_key: settings.apiKey,
      openai_api_key: settings.openaiApiKey,
      anthropic_api_key: settings.anthropicApiKey,
      google_api_key: settings.googleApiKey,
      ai_base_url: settings.baseUrl,
      ai_model: settings.model,
      default_model: settings.defaultModel,
      model_configs: settings.modelConfigs ? JSON.stringify(settings.modelConfigs) : undefined,
      feishu_webhook: settings.feishuWebhook,
    });

    if (error) throw error;
  },

  // Get available models
  async getAvailableModels() {
    return [
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai', description: 'OpenAI的最新旗舰模型，具有强大的推理能力' },
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'OpenAI的多模态模型，支持文本和图像输入' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', description: 'Anthropic的最强大模型，擅长复杂任务' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic', description: 'Anthropic的平衡模型，速度和能力兼顾' },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google', description: 'Google的多模态模型，支持多种任务' },
      { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: '深度求索的中文对话模型' },
    ];
  },

  // Set default model
  async setDefaultModel(modelId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      default_model: modelId,
    });

    if (error) throw error;
  },

  // Get model configuration
  async getModelConfig(modelId: string) {
    const settings = await this.getSettings();
    return settings?.modelConfigs?.[modelId] || {};
  },

  // Save model configuration
  async saveModelConfig(modelId: string, config: Record<string, any>) {
    const settings = await this.getSettings();
    const updatedConfigs = {
      ...settings?.modelConfigs,
      [modelId]: config,
    };

    await this.saveSettings({ modelConfigs: updatedConfigs });
  },

  // Test model connection
  async testModelConnection(modelId: string, apiKey: string) {
    try {
      // 这里可以添加测试模型连接的逻辑
      // 例如发送一个简单的请求到模型API
      return { success: true, message: '连接成功' };
    } catch (error) {
      return { success: false, message: '连接失败: ' + (error as Error).message };
    }
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
