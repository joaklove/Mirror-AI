import { APIGateway } from '../gateway/APIGateway';
import { APIEndpoint } from '../types';
import request from 'supertest';

const mockConfig = {
  port: 3001,
  basePath: '/api/v1',
  rateLimitWindowMs: 60000,
  maxConcurrentRequests: 100,
  timeoutMs: 5000,
  enableCors: true,
  enableLogging: false,
  enableMetrics: false,
  enableCache: false
};

const mockEndpoints: APIEndpoint[] = [
  {
    path: '/test',
    method: 'GET',
    handler: async (req, res) => {
      res.json({ success: true, data: { message: 'Test endpoint' } });
    },
    permissions: [],
    description: 'Test endpoint',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
  {
    path: '/test/:id',
    method: 'GET',
    handler: async (req, res) => {
      res.json({ success: true, data: { id: req.params.id, message: 'Test endpoint with ID' } });
    },
    permissions: [],
    description: 'Test endpoint with ID',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }
];

describe('APIGateway', () => {
  let gateway: APIGateway;

  beforeAll(() => {
    gateway = new APIGateway(mockConfig);
    gateway.registerEndpoints(mockEndpoints);
  });

  describe('Basic functionality', () => {
    it('should return 200 for health check', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 for test endpoint', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/test');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Test endpoint');
    });

    it('should return 200 for test endpoint with ID', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/test/123');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123');
      expect(response.body.data.message).toBe('Test endpoint with ID');
    });

    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/non-existent');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  describe('Performance tests', () => {
    it('should handle multiple requests quickly', async () => {
      const startTime = Date.now();
      const requests = [];

      for (let i = 0; i < 10; i++) {
        requests.push(request(gateway.getApp()).get('/api/v1/test'));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const startTime = Date.now();
      const requests = [];

      for (let i = 0; i < 50; i++) {
        requests.push(request(gateway.getApp()).get('/api/v1/test'));
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('API documentation', () => {
    it('should return Swagger JSON', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/swagger.json');
      expect(response.status).toBe(200);
      expect(response.body.openapi).toBe('3.0.0');
      expect(response.body.info.title).toBe('Mirror AI API');
    });

    it('should serve Swagger UI', async () => {
      const response = await request(gateway.getApp()).get('/api/v1/docs');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Swagger UI');
    });
  });
});
