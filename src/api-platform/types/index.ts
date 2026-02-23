export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: APIPermission[];
  createdAt: string;
  lastUsed: string | null;
  rateLimit: number;
  billingPlan: BillingPlan;
}

export type APIPermission = 
  | 'read:entries'
  | 'write:entries'
  | 'read:analysis'
  | 'read:tags'
  | 'read:settings'
  | 'write:settings'
  | 'read:users'
  | 'write:users';

export interface APIRateLimit {
  requests: number;
  limit: number;
  resetAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimit?: APIRateLimit;
  timestamp: string;
  requestId: string;
}

export interface APIRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export type BillingPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface BillingTier {
  plan: BillingPlan;
  rateLimit: number;
  features: string[];
  price: number;
  currency: string;
}

export interface APIUsage {
  apiKeyId: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  error?: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  handler: (req: any, res: any) => Promise<void>;
  permissions: APIPermission[];
  rateLimit?: number;
  description: string;
  requestSchema?: any;
  responseSchema?: any;
}

export interface APIGatewayConfig {
  port: number;
  basePath: string;
  rateLimitWindowMs: number;
  maxConcurrentRequests: number;
  timeoutMs: number;
  enableCors: boolean;
  enableLogging: boolean;
  enableMetrics: boolean;
  enableCache: boolean;
}
