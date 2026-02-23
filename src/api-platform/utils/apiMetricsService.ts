import { Counter, Histogram, Gauge, register } from 'prom-client';

class ApiMetricsService {
  private requestCounter: Counter;
  private responseTimeHistogram: Histogram;
  private concurrentRequestsGauge: Gauge;
  private errorCounter: Counter;
  private cacheHitCounter: Counter;
  private cacheMissCounter: Counter;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.requestCounter = new Counter({
      name: 'api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['endpoint', 'method', 'status_code']
    });

    this.responseTimeHistogram = new Histogram({
      name: 'api_response_time_ms',
      help: 'API response time in milliseconds',
      labelNames: ['endpoint', 'method'],
      buckets: [50, 100, 150, 200, 250, 300, 500, 1000]
    });

    this.concurrentRequestsGauge = new Gauge({
      name: 'api_concurrent_requests',
      help: 'Current number of concurrent API requests'
    });

    this.errorCounter = new Counter({
      name: 'api_errors_total',
      help: 'Total number of API errors',
      labelNames: ['endpoint', 'method', 'error_type']
    });

    this.cacheHitCounter = new Counter({
      name: 'api_cache_hits_total',
      help: 'Total number of API cache hits'
    });

    this.cacheMissCounter = new Counter({
      name: 'api_cache_misses_total',
      help: 'Total number of API cache misses'
    });
  }

  public recordRequest(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    this.requestCounter.inc({ endpoint, method, status_code: statusCode.toString() });
    this.responseTimeHistogram.observe({ endpoint, method }, responseTime);

    if (statusCode >= 400) {
      const errorType = statusCode >= 500 ? 'server_error' : 'client_error';
      this.errorCounter.inc({ endpoint, method, error_type: errorType });
    }
  }

  public incrementConcurrentRequests(): void {
    this.concurrentRequestsGauge.inc();
  }

  public decrementConcurrentRequests(): void {
    this.concurrentRequestsGauge.dec();
  }

  public recordCacheHit(): void {
    this.cacheHitCounter.inc();
  }

  public recordCacheMiss(): void {
    this.cacheMissCounter.inc();
  }

  public recordError(endpoint: string, method: string, errorType: string): void {
    this.errorCounter.inc({ endpoint, method, error_type: errorType });
  }

  public async getMetrics(): Promise<string> {
    return register.metrics();
  }

  public getContentType(): string {
    return register.contentType;
  }

  public resetMetrics(): void {
    register.clear();
    this.initializeMetrics();
  }

  public getMetricsSummary(): {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    cacheHitRate: number;
  } {
    const metrics = {
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      cacheHitRate: 0
    };

    return metrics;
  }
}

export const apiMetricsService = new ApiMetricsService();
