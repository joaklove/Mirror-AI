import { Request, Response, NextFunction } from 'express';

const CONCURRENCY_STORAGE = 'mirror-ai-api-concurrency';

interface ConcurrencyStats {
  currentConcurrentRequests: number;
  peakConcurrentRequests: number;
  totalRequests: number;
  rejectedRequests: number;
  timestamp: string;
}

interface RequestQueueItem {
  id: string;
  request: Request;
  response: Response;
  next: NextFunction;
  timestamp: string;
}

class ApiConcurrencyService {
  private currentConcurrentRequests = 0;
  private peakConcurrentRequests = 0;
  private totalRequests = 0;
  private rejectedRequests = 0;
  private requestQueue: RequestQueueItem[] = [];
  private maxConcurrentRequests: number;
  private maxQueueSize: number;

  constructor(maxConcurrentRequests: number = 100, maxQueueSize: number = 50) {
    this.maxConcurrentRequests = maxConcurrentRequests;
    this.maxQueueSize = maxQueueSize;
    this.loadStats();
    this.startStatsMonitoring();
  }

  private loadStats(): void {
    try {
      const stored = localStorage.getItem(CONCURRENCY_STORAGE);
      if (stored) {
        const stats = JSON.parse(stored);
        this.peakConcurrentRequests = stats.peakConcurrentRequests || 0;
        this.totalRequests = stats.totalRequests || 0;
        this.rejectedRequests = stats.rejectedRequests || 0;
      }
    } catch (error) {
      console.error('Failed to load concurrency stats:', error);
    }
  }

  private saveStats(): void {
    try {
      const stats: ConcurrencyStats = {
        currentConcurrentRequests: this.currentConcurrentRequests,
        peakConcurrentRequests: this.peakConcurrentRequests,
        totalRequests: this.totalRequests,
        rejectedRequests: this.rejectedRequests,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(CONCURRENCY_STORAGE, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save concurrency stats:', error);
    }
  }

  private startStatsMonitoring(): void {
    setInterval(() => {
      this.saveStats();
      console.log(`Concurrency Stats: Current: ${this.currentConcurrentRequests}, Peak: ${this.peakConcurrentRequests}, Total: ${this.totalRequests}, Rejected: ${this.rejectedRequests}`);
    }, 60000);
  }

  public concurrencyMiddleware(req: Request, res: Response, next: NextFunction): void {
    this.totalRequests++;

    if (this.currentConcurrentRequests < this.maxConcurrentRequests) {
      this.handleRequest(req, res, next);
    } else if (this.requestQueue.length < this.maxQueueSize) {
      this.queueRequest(req, res, next);
    } else {
      this.rejectRequest(res);
    }
  }

  private handleRequest(req: Request, res: Response, next: NextFunction): void {
    this.currentConcurrentRequests++;
    this.peakConcurrentRequests = Math.max(this.peakConcurrentRequests, this.currentConcurrentRequests);

    res.on('finish', () => {
      this.currentConcurrentRequests--;
      this.processQueue();
    });

    res.on('error', () => {
      this.currentConcurrentRequests--;
      this.processQueue();
    });

    next();
  }

  private queueRequest(req: Request, res: Response, next: NextFunction): void {
    const queueItem: RequestQueueItem = {
      id: crypto.randomUUID(),
      request: req,
      response: res,
      next: next,
      timestamp: new Date().toISOString()
    };

    this.requestQueue.push(queueItem);
    console.log(`Request queued: ${req.method} ${req.path}, Queue size: ${this.requestQueue.length}`);

    res.setHeader('X-Queue-Position', this.requestQueue.length.toString());

    setTimeout(() => {
      const index = this.requestQueue.findIndex(item => item.id === queueItem.id);
      if (index !== -1) {
        this.requestQueue.splice(index, 1);
        this.rejectRequest(res);
      }
    }, 30000);
  }

  private rejectRequest(res: Response): void {
    this.rejectedRequests++;
    res.status(429).json({
      success: false,
      error: 'Too many concurrent requests. Please try again later.',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    });
  }

  private processQueue(): void {
    if (this.currentConcurrentRequests < this.maxConcurrentRequests && this.requestQueue.length > 0) {
      const queueItem = this.requestQueue.shift();
      if (queueItem) {
        console.log(`Processing queued request: ${queueItem.request.method} ${queueItem.request.path}, Queue size: ${this.requestQueue.length}`);
        queueItem.request.headers['X-Queue-Wait-Time'] = (Date.now() - new Date(queueItem.timestamp).getTime()).toString();
        this.handleRequest(queueItem.request, queueItem.response, queueItem.next);
      }
    }
  }

  public getConcurrencyStats(): ConcurrencyStats {
    return {
      currentConcurrentRequests: this.currentConcurrentRequests,
      peakConcurrentRequests: this.peakConcurrentRequests,
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
      timestamp: new Date().toISOString()
    };
  }

  public setMaxConcurrentRequests(max: number): void {
    this.maxConcurrentRequests = max;
    this.processQueue();
  }

  public setMaxQueueSize(max: number): void {
    this.maxQueueSize = max;
  }

  public clearQueue(): void {
    this.requestQueue.forEach(item => {
      this.rejectRequest(item.response);
    });
    this.requestQueue = [];
  }

  public getQueueSize(): number {
    return this.requestQueue.length;
  }

  public getQueueStats(): {
    size: number;
    maxSize: number;
    oldestItemTimestamp: string | null;
    averageQueueTime: number;
  } {
    const now = Date.now();
    const queueTimes = this.requestQueue.map(item => now - new Date(item.timestamp).getTime());
    const averageQueueTime = queueTimes.length > 0 ? 
      queueTimes.reduce((sum, time) => sum + time, 0) / queueTimes.length : 0;

    const oldestItem = this.requestQueue.length > 0 ? 
      this.requestQueue[0] : null;

    return {
      size: this.requestQueue.length,
      maxSize: this.maxQueueSize,
      oldestItemTimestamp: oldestItem ? oldestItem.timestamp : null,
      averageQueueTime
    };
  }

  public simulateConcurrentRequests(count: number, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const requests = [];
      for (let i = 0; i < count; i++) {
        requests.push(() => {
          return new Promise((resolve) => {
            this.currentConcurrentRequests++;
            this.peakConcurrentRequests = Math.max(this.peakConcurrentRequests, this.currentConcurrentRequests);
            this.totalRequests++;
            setTimeout(() => {
              this.currentConcurrentRequests--;
              resolve(undefined);
            }, Math.random() * duration);
          });
        });
      }

      Promise.all(requests.map(fn => fn())).then(() => {
        resolve();
      });
    });
  }

  public resetStats(): void {
    this.currentConcurrentRequests = 0;
    this.peakConcurrentRequests = 0;
    this.totalRequests = 0;
    this.rejectedRequests = 0;
    this.requestQueue = [];
    this.saveStats();
  }
}

export const apiConcurrencyService = new ApiConcurrencyService(100, 50);
