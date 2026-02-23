import { APIEndpoint } from '../types';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name: string;
      url: string;
      email: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  security: Array<Record<string, any>>;
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export const generateOpenAPISpec = (endpoints: APIEndpoint[], baseUrl: string): OpenAPISpec => {
  const schemas = {
    JournalEntry: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique identifier for the journal entry' },
        content: { type: 'string', description: 'Content of the journal entry' },
        dimension: { type: 'string', description: 'Dimension of the journal entry' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags associated with the journal entry' },
        created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        user_id: { type: 'string', description: 'User ID associated with the journal entry' }
      },
      required: ['content']
    },
    APIKey: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Unique identifier for the API key' },
        name: { type: 'string', description: 'Name of the API key' },
        key: { type: 'string', description: 'API key value' },
        permissions: { type: 'array', items: { type: 'string' }, description: 'Permissions associated with the API key' },
        createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
        lastUsed: { type: 'string', format: 'date-time', nullable: true, description: 'Last used timestamp' },
        rateLimit: { type: 'integer', description: 'Rate limit for the API key' },
        billingPlan: { type: 'string', description: 'Billing plan for the API key' }
      }
    },
    APIResponse: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: 'Whether the request was successful' },
        data: { type: 'object', nullable: true, description: 'Response data' },
        error: { type: 'string', nullable: true, description: 'Error message if request failed' },
        rateLimit: {
          type: 'object',
          properties: {
            requests: { type: 'integer', description: 'Number of requests made' },
            limit: { type: 'integer', description: 'Maximum number of requests allowed' },
            resetAt: { type: 'string', format: 'date-time', description: 'Timestamp when rate limit resets' }
          }
        },
        timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' },
        requestId: { type: 'string', description: 'Unique request identifier' }
      }
    },
    AnalysisResult: {
      type: 'object',
      properties: {
        totalEntries: { type: 'integer', description: 'Total number of journal entries' },
        dimensions: { type: 'object', additionalProperties: { type: 'integer' }, description: 'Dimension statistics' },
        tags: { type: 'object', additionalProperties: { type: 'integer' }, description: 'Tag statistics' }
      }
    },
    UserSettings: {
      type: 'object',
      properties: {
        theme: { type: 'string', enum: ['light', 'dark', 'system'], description: 'User theme preference' },
        language: { type: 'string', description: 'User language preference' },
        notifications: { type: 'boolean', description: 'Whether notifications are enabled' },
        email: { type: 'string', format: 'email', description: 'User email address' }
      }
    }
  };

  const paths = endpoints.reduce((acc, endpoint) => {
    const path = endpoint.path;
    if (!acc[path]) {
      acc[path] = {};
    }

    acc[path][endpoint.method.toLowerCase()] = {
      summary: endpoint.description,
      description: endpoint.description,
      tags: [getEndpointTag(endpoint.path)],
      security: [{
        ApiKeyAuth: []
      }],
      parameters: getPathParameters(endpoint.path),
      requestBody: endpoint.requestSchema ? {
        required: true,
        content: {
          'application/json': {
            schema: endpoint.requestSchema
          }
        }
      } : undefined,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: endpoint.responseSchema || {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '400': {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '404': {
          description: 'Not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '429': {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        },
        '500': {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/APIResponse'
              }
            }
          }
        }
      }
    };

    return acc;
  }, {} as Record<string, any>);

  return {
    openapi: '3.0.0',
    info: {
      title: 'Mirror AI API',
      description: 'API documentation for Mirror AI - A personal AI companion for mental wellness and self-discovery',
      version: '1.0.0',
      contact: {
        name: 'Mirror AI Team',
        url: 'https://mirror-ai.example.com',
        email: 'support@mirror-ai.example.com'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: baseUrl,
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server'
      }
    ],
    paths,
    components: {
      schemas,
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      }
    },
    security: [{
      ApiKeyAuth: []
    }],
    tags: [
      {
        name: 'Journal',
        description: 'Journal entry management'
      },
      {
        name: 'Analysis',
        description: 'Data analysis endpoints'
      },
      {
        name: 'Tags',
        description: 'Tag management'
      },
      {
        name: 'Settings',
        description: 'User settings management'
      },
      {
        name: 'API Keys',
        description: 'API key management'
      },
      {
        name: 'System',
        description: 'System-level endpoints'
      }
    ]
  };
};

function getEndpointTag(path: string): string {
  if (path.includes('/entries')) return 'Journal';
  if (path.includes('/analysis')) return 'Analysis';
  if (path.includes('/tags')) return 'Tags';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/api-keys')) return 'API Keys';
  return 'System';
}

function getPathParameters(path: string): Array<{
  name: string;
  in: string;
  required: boolean;
  schema: {
    type: string;
  };
  description: string;
}> {
  const parameters: Array<{
    name: string;
    in: string;
    required: boolean;
    schema: {
      type: string;
    };
    description: string;
  }> = [];

  const matches = path.match(/:([^/]+)/g);
  if (matches) {
    matches.forEach(match => {
      const paramName = match.substring(1);
      parameters.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        },
        description: `ID of the ${paramName}`
      });
    });
  }

  return parameters;
}

export default generateOpenAPISpec;
