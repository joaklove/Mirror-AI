import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import apicache from 'apicache';
import { v4 as uuidv4 } from 'uuid';
import { APIKey, APIResponse, APIRateLimit, APIEndpoint, APIGatewayConfig } from '../types';
import { apiAuthService } from '../auth/apiAuthService';
import { apiPermissionService } from '../auth/apiPermissionService';
import { apiUsageService } from '../utils/apiUsageService';
import { apiCacheService } from '../utils/apiCacheService';
import { apiMetricsService } from '../utils/apiMetricsService';
import { apiBillingService } from '../billing/apiBillingService';
import { apiPerformanceService } from '../utils/apiPerformanceService';
import { apiConcurrencyService } from '../utils/apiConcurrencyService';
import { generateOpenAPISpec } from '../docs/openapi';

const cache = apicache.middleware;

class APIGateway {
  private app: Express;
  private config: APIGatewayConfig;
  private endpoints: APIEndpoint[] = [];
  private rateLimitStore = new Map<string, { count: number; resetAt: number }>();
  private concurrentRequests = 0;

  constructor(config: APIGatewayConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(morgan('combined'));

    this.app.use(this.requestIdMiddleware);
    this.app.use(apiConcurrencyService.concurrencyMiddleware.bind(apiConcurrencyService));
    this.app.use(this.responseTimeMiddleware);
    this.app.use(apiPerformanceService.performanceMiddleware.bind(apiPerformanceService));
  }

  private requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void {
    req.headers['x-request-id'] = uuidv4();
    next();
  }

  private concurrentRequestMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (this.concurrentRequests >= this.config.maxConcurrentRequests) {
      return this.sendError(res, 429, 'Too many concurrent requests');
    }

    this.concurrentRequests++;
    res.on('finish', () => {
      this.concurrentRequests--;
    });

    next();
  }

  private responseTimeMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      req.headers['x-response-time'] = responseTime.toString();
      
      if (responseTime > 200) {
        console.warn(`Slow response: ${req.path} took ${responseTime}ms`);
      }
    });
    next();
  }

  private setupRoutes(): void {
    const basePath = this.config.basePath;

    this.app.get(`${basePath}/health`, (req, res) => {
      this.sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.get(`${basePath}/metrics`, async (req, res) => {
      const metrics = await apiMetricsService.getMetrics();
      res.set('Content-Type', apiMetricsService.getContentType());
      res.send(metrics);
    });

    this.app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(null, {
      swaggerOptions: {
        url: `${basePath}/swagger.json`
      }
    }));

    this.app.get(`${basePath}/swagger.json`, (req, res) => {
      res.json(this.getOpenAPISpec());
    });

    this.app.use(`${basePath}/*`, this.apiRequestHandler);
  }

  private async apiRequestHandler(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string;
    const endpoint = req.path.replace(this.config.basePath, '');

    try {
      const apiKey = await this.authenticateRequest(req);
      if (!apiKey) {
        return this.sendError(res, 401, 'Unauthorized');
      }

      if (!this.checkRateLimit(apiKey.id)) {
        return this.sendError(res, 429, 'Rate limit exceeded');
      }

      const matchedEndpoint = this.matchEndpoint(endpoint, req.method);
      if (!matchedEndpoint) {
        return this.sendError(res, 404, 'Endpoint not found');
      }

      if (!this.checkPermissions(apiKey, matchedEndpoint.permissions)) {
        return this.sendError(res, 403, 'Insufficient permissions');
      }

      const cachedResponse = await apiCacheService.getCache(req);
      if (cachedResponse) {
        return this.sendSuccess(res, cachedResponse, this.getRateLimit(apiKey.id));
      }

      await matchedEndpoint.handler(req, res);

      const responseTime = Date.now() - startTime;
      const usageRecord = {
        apiKeyId: apiKey.id,
        endpoint,
        method: req.method,
        responseTime,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      };
      
      await apiUsageService.recordUsage(usageRecord);
      apiBillingService.recordUsage(usageRecord, apiKey.id, apiKey.billingPlan);

      apiMetricsService.recordRequest(endpoint, req.method, responseTime, res.statusCode);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      
      const errorUsageRecord = {
        apiKeyId: req.headers['x-api-key-id'] as string || 'unknown',
        endpoint,
        method: req.method,
        responseTime,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };
      
      await apiUsageService.recordUsage(errorUsageRecord);
      // 对于错误情况，我们也记录计费，但费用为0
      apiBillingService.recordUsage(errorUsageRecord, errorUsageRecord.apiKeyId, 'free');

      apiMetricsService.recordRequest(endpoint, req.method, responseTime, 500);
      this.sendError(res, 500, errorMessage);
    }
  }

  private async authenticateRequest(req: Request): Promise<APIKey | null> {
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (!apiKeyHeader) {
      return null;
    }

    const apiKey = await apiAuthService.validateAPIKey(apiKeyHeader);
    if (apiKey) {
      req.headers['x-api-key-id'] = apiKey.id;
      await apiAuthService.updateLastUsed(apiKey.id);
    }
    return apiKey;
  }

  private checkRateLimit(apiKeyId: string): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(apiKeyId);
    
    if (!record || now > record.resetAt) {
      this.rateLimitStore.set(apiKeyId, { 
        count: 1, 
        resetAt: now + this.config.rateLimitWindowMs 
      });
      return true;
    }
    
    if (record.count >= 100) {
      return false;
    }
    
    record.count++;
    return true;
  }

  private getRateLimit(apiKeyId: string): APIRateLimit {
    const record = this.rateLimitStore.get(apiKeyId) || { 
      count: 0, 
      resetAt: Date.now() + this.config.rateLimitWindowMs 
    };
    return {
      requests: record.count,
      limit: 100,
      resetAt: new Date(record.resetAt).toISOString(),
    };
  }

  private matchEndpoint(path: string, method: string): APIEndpoint | undefined {
    return this.endpoints.find(endpoint => {
      const pathRegex = new RegExp(`^${endpoint.path.replace(/:([^/]+)/g, '([^/]+)')}$`);
      return pathRegex.test(path) && endpoint.method === method;
    });
  }

  private checkPermissions(apiKey: APIKey, requiredPermissions: string[]): boolean {
    return apiPermissionService.checkPermissions(apiKey, requiredPermissions as any);
  }

  public registerEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.push(endpoint);
  }

  public registerEndpoints(endpoints: APIEndpoint[]): void {
    this.endpoints.push(...endpoints);
  }

  private sendSuccess<T>(res: Response, data: T, rateLimit?: APIRateLimit): void {
    const response: APIResponse<T> = {
      success: true,
      data,
      rateLimit,
      timestamp: new Date().toISOString(),
      requestId: res.getHeader('x-request-id') as string || uuidv4()
    };
    res.status(200).json(response);
  }

  private sendError(res: Response, statusCode: number, error: string): void {
    const response: APIResponse<null> = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      requestId: res.getHeader('x-request-id') as string || uuidv4()
    };
    res.status(statusCode).json(response);
  }

  private getOpenAPISpec(): any {
    const baseUrl = `http://localhost:${this.config.port}${this.config.basePath}`;
    return generateOpenAPISpec(this.endpoints, baseUrl);
  }

  public start(): void {
    this.app.listen(this.config.port, () => {
      console.log(`API Gateway running on port ${this.config.port}`);
      console.log(`API Documentation: http://localhost:${this.config.port}${this.config.basePath}/docs`);
      console.log(`Health Check: http://localhost:${this.config.port}${this.config.basePath}/health`);
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

export { APIGateway };
