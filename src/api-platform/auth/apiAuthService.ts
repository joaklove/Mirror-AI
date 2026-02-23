import { APIKey, APIPermission, BillingPlan } from '../types';

const API_KEYS_STORAGE = 'mirror-ai-api-keys';

class ApiAuthService {
  private apiKeys: APIKey[] = [];

  constructor() {
    this.loadAPIKeys();
  }

  private loadAPIKeys(): void {
    try {
      const stored = localStorage.getItem(API_KEYS_STORAGE);
      if (stored) {
        this.apiKeys = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      this.apiKeys = [];
    }
  }

  private saveAPIKeys(): void {
    try {
      localStorage.setItem(API_KEYS_STORAGE, JSON.stringify(this.apiKeys));
    } catch (error) {
      console.error('Failed to save API keys:', error);
    }
  }

  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public generateAPIKey(
    name: string, 
    permissions: APIPermission[],
    billingPlan: BillingPlan = 'free'
  ): APIKey {
    const id = crypto.randomUUID();
    const key = `mra_${this.generateRandomKey(32)}`;
    
    const apiKey: APIKey = {
      id,
      name,
      key,
      permissions,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      rateLimit: this.getRateLimitForPlan(billingPlan),
      billingPlan
    };
    
    this.apiKeys.push(apiKey);
    this.saveAPIKeys();
    return apiKey;
  }

  public getAPIKeys(): APIKey[] {
    return this.apiKeys;
  }

  public getAPIKey(keyId: string): APIKey | undefined {
    return this.apiKeys.find(k => k.id === keyId);
  }

  public deleteAPIKey(keyId: string): void {
    this.apiKeys = this.apiKeys.filter(k => k.id !== keyId);
    this.saveAPIKeys();
  }

  public validateAPIKey(key: string): APIKey | null {
    return this.apiKeys.find(k => k.key === key) || null;
  }

  public updateLastUsed(keyId: string): Promise<void> {
    return new Promise((resolve) => {
      const apiKey = this.getAPIKey(keyId);
      if (apiKey) {
        apiKey.lastUsed = new Date().toISOString();
        this.saveAPIKeys();
      }
      resolve();
    });
  }

  public updateAPIKey(keyId: string, updates: Partial<APIKey>): APIKey | undefined {
    const index = this.apiKeys.findIndex(k => k.id === keyId);
    if (index !== -1) {
      this.apiKeys[index] = { ...this.apiKeys[index], ...updates };
      this.saveAPIKeys();
      return this.apiKeys[index];
    }
    return undefined;
  }

  public hasPermission(apiKey: APIKey, permission: APIPermission): boolean {
    return apiKey.permissions.includes(permission);
  }

  private getRateLimitForPlan(plan: BillingPlan): number {
    switch (plan) {
      case 'free':
        return 100;
      case 'basic':
        return 500;
      case 'pro':
        return 2000;
      case 'enterprise':
        return 10000;
      default:
        return 100;
    }
  }

  public getBillingPlanLimits(plan: BillingPlan): {
    rateLimit: number;
    features: string[];
    price: number;
  } {
    const limits = {
      free: {
        rateLimit: 100,
        features: ['Basic API access', '100 requests/minute', 'Limited endpoints'],
        price: 0
      },
      basic: {
        rateLimit: 500,
        features: ['Full API access', '500 requests/minute', 'Priority support'],
        price: 9.99
      },
      pro: {
        rateLimit: 2000,
        features: ['Full API access', '2000 requests/minute', 'Priority support', 'Advanced analytics'],
        price: 49.99
      },
      enterprise: {
        rateLimit: 10000,
        features: ['Full API access', '10000 requests/minute', '24/7 support', 'Custom endpoints', 'SLA guarantee'],
        price: 999.99
      }
    };

    return limits[plan];
  }

  public validatePermissions(permissions: string[]): permissions is APIPermission[] {
    const validPermissions: APIPermission[] = [
      'read:entries',
      'write:entries',
      'read:analysis',
      'read:tags',
      'read:settings',
      'write:settings',
      'read:users',
      'write:users'
    ];

    return permissions.every(permission => 
      validPermissions.includes(permission as APIPermission)
    );
  }
}

export const apiAuthService = new ApiAuthService();
