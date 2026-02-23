import { APIGateway } from './gateway/APIGateway';
import apiRoutes from './routes/apiRoutes';
import { APIGatewayConfig } from './types';

const config: APIGatewayConfig = {
  port: 3001,
  basePath: '/api/v1',
  rateLimitWindowMs: 60000,
  maxConcurrentRequests: 100,
  timeoutMs: 5000,
  enableCors: true,
  enableLogging: true,
  enableMetrics: true,
  enableCache: true
};

const gateway = new APIGateway(config);
gateway.registerEndpoints(apiRoutes);

export { gateway, config };
export default gateway;
