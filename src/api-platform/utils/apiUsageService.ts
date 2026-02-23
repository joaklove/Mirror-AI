import { APIUsage } from '../types';

const USAGE_STORAGE = 'mirror-ai-api-usage';
const MAX_USAGE_RECORDS = 10000;

class ApiUsageService {
  private usageRecords: APIUsage[] = [];

  constructor() {
    this.loadUsageRecords();
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
      if (this.usageRecords.length > MAX_USAGE_RECORDS) {
        this.usageRecords = this.usageRecords.slice(-MAX_USAGE_RECORDS);
      }
      localStorage.setItem(USAGE_STORAGE, JSON.stringify(this.usageRecords));
    } catch (error) {
      console.error('Failed to save usage records:', error);
    }
  }

  public async recordUsage(usage: APIUsage): Promise<void> {
    return new Promise((resolve) => {
      this.usageRecords.push(usage);
      this.saveUsageRecords();
      resolve();
    });
  }

  public getUsageRecords(): APIUsage[] {
    return this.usageRecords;
  }

  public getUsageByAPIKey(apiKeyId: string): APIUsage[] {
    return this.usageRecords.filter(record => record.apiKeyId === apiKeyId);
  }

  public getUsageByEndpoint(endpoint: string): APIUsage[] {
    return this.usageRecords.filter(record => record.endpoint === endpoint);
  }

  public getRecentUsage(hours: number = 24): APIUsage[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.usageRecords.filter(record => {
      return new Date(record.timestamp).getTime() >= cutoffTime;
    });
  }

  public getUsageStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
    errorRate: number;
  } {
    const totalRequests = this.usageRecords.length;
    const successfulRequests = this.usageRecords.filter(r => r.statusCode >= 200 && r.statusCode < 300).length;
    const failedRequests = totalRequests - successfulRequests;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    const responseTimes = this.usageRecords.map(r => r.responseTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const endpointCounts = this.usageRecords.reduce((acc, record) => {
      acc[record.endpoint] = (acc[record.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      topEndpoints,
      errorRate
    };
  }

  public getUsageTrend(minutes: number = 60): Array<{ time: string; count: number; avgResponseTime: number }> {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentUsage = this.usageRecords.filter(record => {
      return new Date(record.timestamp).getTime() >= cutoffTime;
    });

    const trends: Record<string, { count: number; totalResponseTime: number }> = {};

    recentUsage.forEach(record => {
      const timeKey = new Date(record.timestamp).toISOString().slice(0, 16);
      if (!trends[timeKey]) {
        trends[timeKey] = { count: 0, totalResponseTime: 0 };
      }
      trends[timeKey].count++;
      trends[timeKey].totalResponseTime += record.responseTime;
    });

    return Object.entries(trends)
      .map(([time, data]) => ({
        time,
        count: data.count,
        avgResponseTime: data.totalResponseTime / data.count
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  public clearUsageRecords(): void {
    this.usageRecords = [];
    this.saveUsageRecords();
  }

  public exportUsageRecords(): string {
    return JSON.stringify(this.usageRecords, null, 2);
  }

  public importUsageRecords(data: string): void {
    try {
      const records = JSON.parse(data);
      if (Array.isArray(records)) {
        this.usageRecords = records;
        this.saveUsageRecords();
      }
    } catch (error) {
      console.error('Failed to import usage records:', error);
    }
  }
}

export const apiUsageService = new ApiUsageService();
