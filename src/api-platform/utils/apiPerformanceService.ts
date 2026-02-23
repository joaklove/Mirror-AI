import { Request, Response, NextFunction } from 'express';
import { apiCacheService } from './apiCacheService';

const PERFORMANCE_STORAGE = 'mirror-ai-api-performance';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  timestamp: string;
  statusCode: number;
  cacheHit: boolean;
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  endpoints: Record<string, {
    count: number;
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
  }>;
}

class ApiPerformanceService {
  private performanceMetrics: PerformanceMetric[] = [];
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor() {
    this.loadMetrics();
    this.startPerformanceMonitoring();
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(PERFORMANCE_STORAGE);
      if (stored) {
        this.performanceMetrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      this.performanceMetrics = [];
    }
  }

  private saveMetrics(): void {
    try {
      if (this.performanceMetrics.length > 10000) {
        this.performanceMetrics = this.performanceMetrics.slice(-10000);
      }
      localStorage.setItem(PERFORMANCE_STORAGE, JSON.stringify(this.performanceMetrics));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.analyzePerformance();
    }, 60000);
  }

  public performanceMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const originalSend = res.send.bind(res);
    let cacheHit = false;

    res.send = function(body) {
      const responseTime = Date.now() - startTime;
      cacheHit = res.headers['x-cache'] === 'HIT';

      this.performanceService?.recordMetric({
        endpoint: req.path,
        method: req.method,
        responseTime,
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        cacheHit
      });

      if (responseTime > 200) {
        console.warn(`Slow response: ${req.method} ${req.path} took ${responseTime}ms`);
      }

      return originalSend(body);
    }.bind(res);

    (res as any).performanceService = this;
    next();
  }

  public async recordMetric(metric: PerformanceMetric): Promise<void> {
    this.performanceMetrics.push(metric);
    this.saveMetrics();
  }

  public getPerformanceStats(): PerformanceStats {
    const totalRequests = this.performanceMetrics.length;
    const responseTimes = this.performanceMetrics.map(m => m.responseTime);
    const cacheHits = this.performanceMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(totalRequests * 0.95);
    const p99Index = Math.floor(totalRequests * 0.99);

    const endpoints = this.performanceMetrics.reduce((acc, metric) => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!acc[key]) {
        acc[key] = {
          count: 0,
          avgResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: Infinity
        };
      }

      acc[key].count++;
      acc[key].avgResponseTime = (acc[key].avgResponseTime * (acc[key].count - 1) + metric.responseTime) / acc[key].count;
      acc[key].maxResponseTime = Math.max(acc[key].maxResponseTime, metric.responseTime);
      acc[key].minResponseTime = Math.min(acc[key].minResponseTime, metric.responseTime);

      return acc;
    }, {} as Record<string, {
      count: number;
      avgResponseTime: number;
      maxResponseTime: number;
      minResponseTime: number;
    }>);

    return {
      totalRequests,
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0,
      p95ResponseTime: p95Index < totalRequests ? responseTimes[p95Index] : 0,
      p99ResponseTime: p99Index < totalRequests ? responseTimes[p99Index] : 0,
      cacheHitRate,
      endpoints
    };
  }

  public async batchRequests(requests: Array<() => Promise<any>>): Promise<any[]> {
    return Promise.all(requests);
  }

  public async queueRequest(request: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(() => {
        return request().finally(resolve);
      });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const request = this.requestQueue.shift();

    if (request) {
      try {
        await request();
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }

    this.processQueue();
  }

  public optimizeResponse<T>(data: T): T {
    if (typeof data === 'object' && data !== null) {
      return JSON.parse(JSON.stringify(data));
    }
    return data;
  }

  public compressResponse(data: any): Buffer {
    return Buffer.from(JSON.stringify(data));
  }

  public async optimizeCacheKey(req: Request): Promise<string> {
    const { method, originalUrl, query } = req;
    const queryString = Object.keys(query)
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');
    return `${method}:${originalUrl}:${queryString}`;
  }

  public getSlowEndpoints(threshold: number = 200): Array<{
    endpoint: string;
    method: string;
    avgResponseTime: number;
    count: number;
  }> {
    const stats = this.getPerformanceStats();
    return Object.entries(stats.endpoints)
      .map(([key, data]) => {
        const [method, ...endpointParts] = key.split(' ');
        const endpoint = endpointParts.join(' ');
        return {
          endpoint,
          method,
          avgResponseTime: data.avgResponseTime,
          count: data.count
        };
      })
      .filter(item => item.avgResponseTime > threshold)
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime);
  }

  public clearMetrics(): void {
    this.performanceMetrics = [];
    this.saveMetrics();
  }

  public exportMetrics(): string {
    return JSON.stringify(this.performanceMetrics, null, 2);
  }

  public importMetrics(data: string): void {
    try {
      const metrics = JSON.parse(data);
      if (Array.isArray(metrics)) {
        this.performanceMetrics = metrics;
        this.saveMetrics();
      }
    } catch (error) {
      console.error('Failed to import performance metrics:', error);
    }
  }

  private analyzePerformance(): void {
    const stats = this.getPerformanceStats();
    const slowEndpoints = this.getSlowEndpoints();

    if (slowEndpoints.length > 0) {
      console.log('Slow endpoints detected:');
      slowEndpoints.forEach(endpoint => {
        console.log(`${endpoint.method} ${endpoint.endpoint}: ${endpoint.avgResponseTime.toFixed(2)}ms (${endpoint.count} requests)`);
      });
    }

    console.log(`\nPerformance Stats:`);
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.log(`Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
    console.log(`P95 Response Time: ${stats.p95ResponseTime.toFixed(2)}ms`);
    console.log(`P99 Response Time: ${stats.p99ResponseTime.toFixed(2)}ms`);
    console.log(`Cache Hit Rate: ${stats.cacheHitRate.toFixed(2)}%`);
  }
}

export const apiPerformanceService = new ApiPerformanceService();
