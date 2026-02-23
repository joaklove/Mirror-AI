import { APIEndpoint } from '../types';
import { journalService } from '../../services/journalService';
import { apiAuthService } from '../auth/apiAuthService';
import { apiCacheService } from '../utils/apiCacheService';

const apiRoutes: APIEndpoint[] = [
  {
    path: '/entries',
    method: 'GET',
    handler: async (req, res) => {
      const entries = await journalService.getEntries();
      await apiCacheService.setCache(req, entries);
      res.json({ success: true, data: entries });
    },
    permissions: ['read:entries'],
    description: 'Get all journal entries',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              dimension: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              created_at: { type: 'string' },
              user_id: { type: 'string' }
            }
          }
        }
      }
    }
  },
  {
    path: '/entries',
    method: 'POST',
    handler: async (req, res) => {
      const entry = await journalService.createEntry(req.body);
      apiCacheService.invalidateCacheForEndpoint('/entries');
      res.json({ success: true, data: entry });
    },
    permissions: ['write:entries'],
    description: 'Create a new journal entry',
    requestSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        dimension: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['content']
    },
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            dimension: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string' },
            user_id: { type: 'string' }
          }
        }
      }
    }
  },
  {
    path: '/entries/:id',
    method: 'GET',
    handler: async (req, res) => {
      const entry = await journalService.getEntryById(req.params.id);
      if (!entry) {
        return res.status(404).json({ success: false, error: 'Entry not found' });
      }
      await apiCacheService.setCache(req, entry);
      res.json({ success: true, data: entry });
    },
    permissions: ['read:entries'],
    description: 'Get a journal entry by ID',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            dimension: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string' },
            user_id: { type: 'string' }
          }
        }
      }
    }
  },
  {
    path: '/entries/:id',
    method: 'PUT',
    handler: async (req, res) => {
      const entry = await journalService.updateEntry(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ success: false, error: 'Entry not found' });
      }
      apiCacheService.invalidateCacheForEndpoint('/entries');
      res.json({ success: true, data: entry });
    },
    permissions: ['write:entries'],
    description: 'Update a journal entry',
    requestSchema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        dimension: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } }
      }
    },
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            dimension: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string' },
            user_id: { type: 'string' }
          }
        }
      }
    }
  },
  {
    path: '/entries/:id',
    method: 'DELETE',
    handler: async (req, res) => {
      const success = await journalService.deleteEntry(req.params.id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Entry not found' });
      }
      apiCacheService.invalidateCacheForEndpoint('/entries');
      res.json({ success: true });
    },
    permissions: ['write:entries'],
    description: 'Delete a journal entry',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  },
  {
    path: '/analysis',
    method: 'GET',
    handler: async (req, res) => {
      const entries = await journalService.getEntries();
      const analysis = {
        totalEntries: entries.length,
        dimensions: calculateDimensionStats(entries),
        tags: calculateTagStats(entries)
      };
      await apiCacheService.setCache(req, analysis);
      res.json({ success: true, data: analysis });
    },
    permissions: ['read:analysis'],
    description: 'Get journal analysis',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            totalEntries: { type: 'number' },
            dimensions: { type: 'object' },
            tags: { type: 'object' }
          }
        }
      }
    }
  },
  {
    path: '/tags',
    method: 'GET',
    handler: async (req, res) => {
      const entries = await journalService.getEntries();
      const allTags = new Set<string>();
      entries.forEach(e => e.tags?.forEach(t => allTags.add(t)));
      const tags = Array.from(allTags);
      await apiCacheService.setCache(req, tags);
      res.json({ success: true, data: tags });
    },
    permissions: ['read:tags'],
    description: 'Get all tags',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  },
  {
    path: '/settings',
    method: 'GET',
    handler: async (req, res) => {
      const settings = await journalService.getSettings();
      await apiCacheService.setCache(req, settings);
      res.json({ success: true, data: settings });
    },
    permissions: ['read:settings'],
    description: 'Get user settings',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    }
  },
  {
    path: '/settings',
    method: 'PUT',
    handler: async (req, res) => {
      const settings = await journalService.updateSettings(req.body);
      apiCacheService.invalidateCacheForEndpoint('/settings');
      res.json({ success: true, data: settings });
    },
    permissions: ['write:settings'],
    description: 'Update user settings',
    requestSchema: {
      type: 'object'
    },
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object' }
      }
    }
  },
  {
    path: '/api-keys',
    method: 'GET',
    handler: async (req, res) => {
      const apiKeys = apiAuthService.getAPIKeys();
      res.json({ success: true, data: apiKeys });
    },
    permissions: ['read:users'],
    description: 'Get API keys',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              key: { type: 'string' },
              permissions: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string' },
              lastUsed: { type: 'string' },
              rateLimit: { type: 'number' },
              billingPlan: { type: 'string' }
            }
          }
        }
      }
    }
  },
  {
    path: '/api-keys',
    method: 'POST',
    handler: async (req, res) => {
      const { name, permissions, billingPlan } = req.body;
      const apiKey = apiAuthService.generateAPIKey(name, permissions, billingPlan);
      res.json({ success: true, data: apiKey });
    },
    permissions: ['write:users'],
    description: 'Create API key',
    requestSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        permissions: { type: 'array', items: { type: 'string' } },
        billingPlan: { type: 'string', enum: ['free', 'basic', 'pro', 'enterprise'] }
      },
      required: ['name', 'permissions']
    },
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            key: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string' },
            lastUsed: { type: 'string' },
            rateLimit: { type: 'number' },
            billingPlan: { type: 'string' }
          }
        }
      }
    }
  },
  {
    path: '/api-keys/:id',
    method: 'DELETE',
    handler: async (req, res) => {
      apiAuthService.deleteAPIKey(req.params.id);
      res.json({ success: true });
    },
    permissions: ['write:users'],
    description: 'Delete API key',
    responseSchema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' }
      }
    }
  }
];

function calculateDimensionStats(entries: any[]): Record<string, number> {
  const stats: Record<string, number> = {};
  entries.forEach(e => {
    if (e.dimension) {
      stats[e.dimension] = (stats[e.dimension] || 0) + 1;
    }
  });
  return stats;
}

function calculateTagStats(entries: any[]): Record<string, number> {
  const stats: Record<string, number> = {};
  entries.forEach(e => {
    e.tags?.forEach(tag => {
      stats[tag] = (stats[tag] || 0) + 1;
    });
  });
  return stats;
}

export default apiRoutes;
