import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string | null;
  rateLimit: number;
  billingPlan: string;
}

interface JournalEntry {
  id: string;
  content: string;
  dimension?: string;
  tags?: string[];
  created_at: string;
  user_id: string;
}

interface AnalysisResult {
  totalEntries: number;
  dimensions: Record<string, number>;
  tags: Record<string, number>;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimit?: {
    requests: number;
    limit: number;
    resetAt: string;
  };
  timestamp: string;
  requestId: string;
}

interface SDKConfig {
  apiKey: string;
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class MirrorAISDK {
  private axios: AxiosInstance;
  private apiKey: string;

  constructor(config: SDKConfig) {
    this.apiKey = config.apiKey;
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError = error.response.data as APIResponse<null>;
          if (apiError.error) {
            error.message = apiError.error;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<APIResponse<T>> = await this.axios(config);
    if (!response.data.success) {
      throw new Error(response.data.error || 'API request failed');
    }
    return response.data.data as T;
  }

  // Journal Entry Methods
  async getEntries(): Promise<JournalEntry[]> {
    return this.request<JournalEntry[]>({
      method: 'GET',
      url: '/entries'
    });
  }

  async getEntryById(id: string): Promise<JournalEntry> {
    return this.request<JournalEntry>({
      method: 'GET',
      url: `/entries/${id}`
    });
  }

  async createEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>): Promise<JournalEntry> {
    return this.request<JournalEntry>({
      method: 'POST',
      url: '/entries',
      data: entry
    });
  }

  async updateEntry(id: string, entry: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'user_id'>>): Promise<JournalEntry> {
    return this.request<JournalEntry>({
      method: 'PUT',
      url: `/entries/${id}`,
      data: entry
    });
  }

  async deleteEntry(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/entries/${id}`
    });
  }

  // Analysis Methods
  async getAnalysis(): Promise<AnalysisResult> {
    return this.request<AnalysisResult>({
      method: 'GET',
      url: '/analysis'
    });
  }

  // Tags Methods
  async getTags(): Promise<string[]> {
    return this.request<string[]>({
      method: 'GET',
      url: '/tags'
    });
  }

  // Settings Methods
  async getSettings(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>({
      method: 'GET',
      url: '/settings'
    });
  }

  async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    return this.request<Record<string, any>>({
      method: 'PUT',
      url: '/settings',
      data: settings
    });
  }

  // API Keys Methods
  async getAPIKeys(): Promise<APIKey[]> {
    return this.request<APIKey[]>({
      method: 'GET',
      url: '/api-keys'
    });
  }

  async createAPIKey(name: string, permissions: string[], billingPlan: string = 'free'): Promise<APIKey> {
    return this.request<APIKey>({
      method: 'POST',
      url: '/api-keys',
      data: { name, permissions, billingPlan }
    });
  }

  async deleteAPIKey(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>({
      method: 'DELETE',
      url: `/api-keys/${id}`
    });
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>({
      method: 'GET',
      url: '/health'
    });
  }

  // Utility Methods
  getAPIKey(): string {
    return this.apiKey;
  }

  setAPIKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.axios.defaults.headers.common['X-API-Key'] = apiKey;
  }

  setBaseURL(baseURL: string): void {
    this.axios.defaults.baseURL = baseURL;
  }

  getBaseURL(): string {
    return this.axios.defaults.baseURL || '';
  }
}

export { MirrorAISDK, SDKConfig, APIKey, JournalEntry, AnalysisResult, APIResponse };
export default MirrorAISDK;
