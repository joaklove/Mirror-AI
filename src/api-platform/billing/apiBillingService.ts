import { BillingPlan, BillingTier, APIUsage } from '../types';

const BILLING_STORAGE = 'mirror-ai-api-billing';
const USAGE_STORAGE = 'mirror-ai-api-usage';

interface BillingRecord {
  id: string;
  apiKeyId: string;
  period: string;
  usage: number;
  cost: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface UsageRecord {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  cost: number;
}

const billingTiers: Record<BillingPlan, BillingTier> = {
  free: {
    plan: 'free',
    rateLimit: 1000,
    features: [
      '1,000 requests per day',
      'Basic API access',
      'Community support',
      '7-day data retention'
    ],
    price: 0,
    currency: 'USD'
  },
  basic: {
    plan: 'basic',
    rateLimit: 10000,
    features: [
      '10,000 requests per day',
      'Full API access',
      'Email support',
      '30-day data retention'
    ],
    price: 9.99,
    currency: 'USD'
  },
  pro: {
    plan: 'pro',
    rateLimit: 100000,
    features: [
      '100,000 requests per day',
      'Full API access',
      'Priority support',
      '90-day data retention',
      'Advanced analytics'
    ],
    price: 49.99,
    currency: 'USD'
  },
  enterprise: {
    plan: 'enterprise',
    rateLimit: 1000000,
    features: [
      '1,000,000 requests per day',
      'Full API access',
      '24/7 support',
      '365-day data retention',
      'Custom endpoints',
      'SLA guarantee',
      'Dedicated account manager'
    ],
    price: 999.99,
    currency: 'USD'
  }
};

class ApiBillingService {
  private billingRecords: BillingRecord[] = [];
  private usageRecords: UsageRecord[] = [];

  constructor() {
    this.loadBillingRecords();
    this.loadUsageRecords();
  }

  private loadBillingRecords(): void {
    try {
      const stored = localStorage.getItem(BILLING_STORAGE);
      if (stored) {
        this.billingRecords = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load billing records:', error);
      this.billingRecords = [];
    }
  }

  private saveBillingRecords(): void {
    try {
      localStorage.setItem(BILLING_STORAGE, JSON.stringify(this.billingRecords));
    } catch (error) {
      console.error('Failed to save billing records:', error);
    }
  }

  private loadUsageRecords(): void {
    try {
      const stored = localStorage.getItem(USAGE_STORAGE);
      if (stored) {
        this.usageRecords = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load usage records:', error);
      this.usageRecords = [];
    }
  }

  private saveUsageRecords(): void {
    try {
      localStorage.setItem(USAGE_STORAGE, JSON.stringify(this.usageRecords));
    } catch (error) {
      console.error('Failed to save usage records:', error);
    }
  }

  public getBillingTier(plan: BillingPlan): BillingTier {
    return billingTiers[plan];
  }

  public getAllBillingTiers(): BillingTier[] {
    return Object.values(billingTiers);
  }

  public calculateCost(usage: APIUsage, plan: BillingPlan): number {
    if (plan === 'free') {
      return 0;
    }

    const tier = billingTiers[plan];
    const baseCost = tier.price;
    const overageRate = baseCost / tier.rateLimit * 1.5;

    return baseCost;
  }

  public recordUsage(usage: APIUsage, apiKeyId: string, plan: BillingPlan): void {
    const cost = this.calculateCost(usage, plan);
    const usageRecord: UsageRecord = {
      id: crypto.randomUUID(),
      apiKeyId,
      endpoint: usage.endpoint,
      method: usage.method,
      responseTime: usage.responseTime,
      statusCode: usage.statusCode,
      timestamp: usage.timestamp,
      cost
    };

    this.usageRecords.push(usageRecord);
    this.saveUsageRecords();

    this.updateBillingForPeriod(apiKeyId, usage.timestamp, cost);
  }

  private updateBillingForPeriod(apiKeyId: string, timestamp: string, cost: number): void {
    const period = new Date(timestamp).toISOString().slice(0, 7);
    const existingRecord = this.billingRecords.find(
      record => record.apiKeyId === apiKeyId && record.period === period
    );

    if (existingRecord) {
      existingRecord.usage += 1;
      existingRecord.cost += cost;
      existingRecord.updatedAt = new Date().toISOString();
    } else {
      const newRecord: BillingRecord = {
        id: crypto.randomUUID(),
        apiKeyId,
        period,
        usage: 1,
        cost,
        currency: 'USD',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.billingRecords.push(newRecord);
    }

    this.saveBillingRecords();
  }

  public getBillingRecords(apiKeyId?: string): BillingRecord[] {
    if (apiKeyId) {
      return this.billingRecords.filter(record => record.apiKeyId === apiKeyId);
    }
    return this.billingRecords;
  }

  public getBillingRecordById(id: string): BillingRecord | undefined {
    return this.billingRecords.find(record => record.id === id);
  }

  public getUsageRecords(apiKeyId?: string): UsageRecord[] {
    if (apiKeyId) {
      return this.usageRecords.filter(record => record.apiKeyId === apiKeyId);
    }
    return this.usageRecords;
  }

  public getUsageForPeriod(apiKeyId: string, period: string): UsageRecord[] {
    return this.usageRecords.filter(record => {
      const recordPeriod = new Date(record.timestamp).toISOString().slice(0, 7);
      return record.apiKeyId === apiKeyId && recordPeriod === period;
    });
  }

  public getUsageStats(apiKeyId: string, days: number = 30): {
    totalRequests: number;
    totalCost: number;
    averageCostPerRequest: number;
    topEndpoints: Array<{ endpoint: string; count: number; cost: number }>;
    dailyUsage: Array<{ date: string; requests: number; cost: number }>;
  } {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentUsage = this.usageRecords.filter(record => {
      return record.apiKeyId === apiKeyId && 
             new Date(record.timestamp).getTime() >= cutoffTime;
    });

    const totalRequests = recentUsage.length;
    const totalCost = recentUsage.reduce((sum, record) => sum + record.cost, 0);
    const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

    const endpointStats = recentUsage.reduce((acc, record) => {
      if (!acc[record.endpoint]) {
        acc[record.endpoint] = { count: 0, cost: 0 };
      }
      acc[record.endpoint].count++;
      acc[record.endpoint].cost += record.cost;
      return acc;
    }, {} as Record<string, { count: number; cost: number }>);

    const topEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const dailyStats = recentUsage.reduce((acc, record) => {
      const date = new Date(record.timestamp).toISOString().slice(0, 10);
      if (!acc[date]) {
        acc[date] = { requests: 0, cost: 0 };
      }
      acc[date].requests++;
      acc[date].cost += record.cost;
      return acc;
    }, {} as Record<string, { requests: number; cost: number }>);

    const dailyUsage = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRequests,
      totalCost,
      averageCostPerRequest,
      topEndpoints,
      dailyUsage
    };
  }

  public updateBillingStatus(id: string, status: 'pending' | 'paid' | 'overdue'): BillingRecord | undefined {
    const record = this.getBillingRecordById(id);
    if (record) {
      record.status = status;
      record.updatedAt = new Date().toISOString();
      this.saveBillingRecords();
    }
    return record;
  }

  public generateInvoice(apiKeyId: string, period: string): {
    id: string;
    apiKeyId: string;
    period: string;
    usage: number;
    cost: number;
    currency: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    subtotal: number;
    taxes: number;
    total: number;
    createdAt: string;
  } {
    const billingRecord = this.billingRecords.find(
      record => record.apiKeyId === apiKeyId && record.period === period
    );

    if (!billingRecord) {
      throw new Error(`No billing record found for API key ${apiKeyId} in period ${period}`);
    }

    const usageRecords = this.getUsageForPeriod(apiKeyId, period);
    const endpointCounts = usageRecords.reduce((acc, record) => {
      acc[record.endpoint] = (acc[record.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const items = Object.entries(endpointCounts).map(([endpoint, quantity]) => {
      const unitPrice = billingRecord.cost / billingRecord.usage;
      return {
        description: `API calls to ${endpoint}`,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      };
    });

    const subtotal = billingRecord.cost;
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    return {
      id: crypto.randomUUID(),
      apiKeyId,
      period,
      usage: billingRecord.usage,
      cost: billingRecord.cost,
      currency: billingRecord.currency,
      items,
      subtotal,
      taxes,
      total,
      createdAt: new Date().toISOString()
    };
  }

  public estimateCost(apiKeyId: string, projectedUsage: number, plan: BillingPlan): number {
    const tier = billingTiers[plan];
    if (plan === 'free') {
      return 0;
    }

    const baseCost = tier.price;
    const overage = Math.max(0, projectedUsage - tier.rateLimit);
    const overageRate = baseCost / tier.rateLimit * 1.5;
    const overageCost = overage * overageRate;

    return baseCost + overageCost;
  }

  public clearOldUsageRecords(days: number = 90): void {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    this.usageRecords = this.usageRecords.filter(record => {
      return new Date(record.timestamp).getTime() >= cutoffTime;
    });
    this.saveUsageRecords();
  }
}

export const apiBillingService = new ApiBillingService();
