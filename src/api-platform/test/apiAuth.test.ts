import { apiAuthService } from '../auth/apiAuthService';
import { apiPermissionService } from '../auth/apiPermissionService';
import { APIPermission, BillingPlan } from '../types';

describe('API Authentication and Authorization', () => {
  describe('apiAuthService', () => {
    it('should generate a valid API key', () => {
      const permissions: APIPermission[] = ['read:entries', 'read:analysis'];
      const apiKey = apiAuthService.generateAPIKey('Test API Key', permissions, 'basic');

      expect(apiKey).toBeDefined();
      expect(apiKey.id).toBeDefined();
      expect(apiKey.name).toBe('Test API Key');
      expect(apiKey.permissions).toEqual(permissions);
      expect(apiKey.billingPlan).toBe('basic');
      expect(apiKey.key).toMatch(/^mra_/);
      expect(apiKey.createdAt).toBeDefined();
      expect(apiKey.lastUsed).toBeNull();
    });

    it('should validate a valid API key', () => {
      const permissions: APIPermission[] = ['read:entries'];
      const generatedKey = apiAuthService.generateAPIKey('Test API Key', permissions);
      const validatedKey = apiAuthService.validateAPIKey(generatedKey.key);

      expect(validatedKey).toBeDefined();
      expect(validatedKey?.id).toBe(generatedKey.id);
      expect(validatedKey?.name).toBe(generatedKey.name);
    });

    it('should return null for invalid API key', () => {
      const validatedKey = apiAuthService.validateAPIKey('invalid_key');
      expect(validatedKey).toBeNull();
    });

    it('should get all API keys', () => {
      const initialKeys = apiAuthService.getAPIKeys();
      const permissions: APIPermission[] = ['read:entries'];
      apiAuthService.generateAPIKey('Test API Key', permissions);
      const updatedKeys = apiAuthService.getAPIKeys();

      expect(updatedKeys.length).toBeGreaterThan(initialKeys.length);
    });

    it('should delete an API key', () => {
      const permissions: APIPermission[] = ['read:entries'];
      const apiKey = apiAuthService.generateAPIKey('Test API Key', permissions);
      const initialKeys = apiAuthService.getAPIKeys();
      apiAuthService.deleteAPIKey(apiKey.id);
      const updatedKeys = apiAuthService.getAPIKeys();

      expect(updatedKeys.length).toBeLessThan(initialKeys.length);
      expect(updatedKeys.find(key => key.id === apiKey.id)).toBeUndefined();
    });

    it('should update last used timestamp', async () => {
      const permissions: APIPermission[] = ['read:entries'];
      const apiKey = apiAuthService.generateAPIKey('Test API Key', permissions);
      expect(apiKey.lastUsed).toBeNull();

      await apiAuthService.updateLastUsed(apiKey.id);
      const updatedKey = apiAuthService.getAPIKey(apiKey.id);
      expect(updatedKey?.lastUsed).toBeDefined();
    });
  });

  describe('apiPermissionService', () => {
    it('should get all roles', () => {
      const roles = apiPermissionService.getRoles();
      expect(roles).toBeDefined();
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThan(0);
    });

    it('should get permissions for a role', () => {
      const adminPermissions = apiPermissionService.getPermissionsForRole('admin');
      expect(adminPermissions).toBeDefined();
      expect(Array.isArray(adminPermissions)).toBe(true);
      expect(adminPermissions.length).toBeGreaterThan(0);
    });

    it('should check permissions correctly', () => {
      const permissions: APIPermission[] = ['read:entries', 'read:analysis'];
      const apiKey = apiAuthService.generateAPIKey('Test API Key', permissions);

      expect(apiPermissionService.checkPermission(apiKey, 'read:entries')).toBe(true);
      expect(apiPermissionService.checkPermission(apiKey, 'write:entries')).toBe(false);
      expect(apiPermissionService.checkPermissions(apiKey, ['read:entries', 'read:analysis'])).toBe(true);
      expect(apiPermissionService.checkPermissions(apiKey, ['read:entries', 'write:entries'])).toBe(false);
    });

    it('should get missing permissions', () => {
      const permissions: APIPermission[] = ['read:entries'];
      const apiKey = apiAuthService.generateAPIKey('Test API Key', permissions);
      const requiredPermissions: APIPermission[] = ['read:entries', 'write:entries', 'read:analysis'];

      const missingPermissions = apiPermissionService.getMissingPermissions(apiKey, requiredPermissions);
      expect(missingPermissions).toEqual(['write:entries', 'read:analysis']);
    });

    it('should assign role to API key', () => {
      const apiKey = apiAuthService.generateAPIKey('Test API Key', []);
      const adminKey = apiPermissionService.assignRoleToAPIKey(apiKey, 'admin');

      expect(adminKey.permissions).toBeDefined();
      expect(adminKey.permissions.length).toBeGreaterThan(0);
    });

    it('should validate permissions', () => {
      const validPermissions: APIPermission[] = ['read:entries', 'read:analysis'];
      const invalidPermissions = ['read:entries', 'invalid:permission'];

      expect(apiPermissionService.validatePermissions(validPermissions)).toBe(true);
      expect(apiPermissionService.validatePermissions(invalidPermissions)).toBe(false);
    });
  });
});
