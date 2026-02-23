export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export type WebhookEventType = 
  | 'journal.created'
  | 'journal.deleted'
  | 'reminder.triggered'
  | 'analysis.completed'
  | 'milestone.achieved';

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEventType[];
  enabled: boolean;
  secret?: string;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

const WEBHOOK_STORAGE_KEY = 'webhook_configs';

export const webhookService = {
  getConfigs(): WebhookConfig[] {
    const stored = localStorage.getItem(WEBHOOK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveConfig(config: WebhookConfig): void {
    const configs = this.getConfigs();
    const index = configs.findIndex(c => c.id === config.id);
    
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    
    localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(configs));
  },

  deleteConfig(id: string): void {
    const configs = this.getConfigs().filter(c => c.id !== id);
    localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(configs));
  },

  async sendWebhook(payload: WebhookPayload, config: WebhookConfig): Promise<boolean> {
    if (!config.enabled) return false;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (config.secret) {
        const signature = this.generateSignature(payload, config.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      return false;
    }
  },

  generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const timestamp = payload.timestamp;
    const signature = `${timestamp}.${hash}`;
    
    return signature;
  },

  async notifyEvent(
    eventType: WebhookEventType,
    data: Record<string, unknown>
  ): Promise<void> {
    const configs = this.getConfigs().filter(c => c.enabled && c.events.includes(eventType));
    
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    const results = await Promise.all(
      configs.map(config => this.sendWebhook(payload, config))
    );

    const successCount = results.filter(r => r).length;
    if (successCount > 0) {
      console.log(`Webhook delivered to ${successCount}/${configs.length} endpoints`);
    }
  },

  async onJournalCreated(entry: {
    id: string;
    content: string;
    dimension?: string;
    tags?: string[];
  }): Promise<void> {
    await this.notifyEvent('journal.created', {
      entry_id: entry.id,
      content_preview: entry.content.substring(0, 100),
      dimension: entry.dimension,
      tags: entry.tags,
    });
  },

  async onMilestoneAchieved(milestone: {
    type: string;
    count: number;
    description: string;
  }): Promise<void> {
    await this.notifyEvent('milestone.achieved', milestone);
  },

  async onAnalysisCompleted(analysis: {
    type: string;
    insights: string[];
  }): Promise<void> {
    await this.notifyEvent('analysis.completed', analysis);
  },

  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },

  testWebhook(config: WebhookConfig): Promise<boolean> {
    return this.sendWebhook({
      event: 'analysis.completed',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook from 心镜 AI',
      },
    }, { ...config, enabled: true });
  },
};
