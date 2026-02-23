import { APIPermission, APIKey } from '../types';

const ROLES_STORAGE = 'mirror-ai-api-roles';

export type Role = 'admin' | 'developer' | 'reader' | 'writer' | 'analyst';

export interface RoleDefinition {
  name: Role;
  description: string;
  permissions: APIPermission[];
}

const defaultRoles: RoleDefinition[] = [
  {
    name: 'admin',
    description: 'Full access to all API endpoints',
    permissions: [
      'read:entries',
      'write:entries',
      'read:analysis',
      'read:tags',
      'read:settings',
      'write:settings',
      'read:users',
      'write:users'
    ]
  },
  {
    name: 'developer',
    description: 'Access to most API endpoints for development',
    permissions: [
      'read:entries',
      'write:entries',
      'read:analysis',
      'read:tags',
      'read:settings'
    ]
  },
  {
    name: 'reader',
    description: 'Read-only access to data',
    permissions: [
      'read:entries',
      'read:analysis',
      'read:tags',
      'read:settings'
    ]
  },
  {
    name: 'writer',
    description: 'Read and write access to journal entries',
    permissions: [
      'read:entries',
      'write:entries',
      'read:tags'
    ]
  },
  {
    name: 'analyst',
    description: 'Access to analysis endpoints',
    permissions: [
      'read:entries',
      'read:analysis',
      'read:tags'
    ]
  }
];

class ApiPermissionService {
  private roles: RoleDefinition[];

  constructor() {
    this.loadRoles();
  }

  private loadRoles(): void {
    try {
      const stored = localStorage.getItem(ROLES_STORAGE);
      if (stored) {
        this.roles = JSON.parse(stored);
      } else {
        this.roles = defaultRoles;
        this.saveRoles();
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      this.roles = defaultRoles;
    }
  }

  private saveRoles(): void {
    try {
      localStorage.setItem(ROLES_STORAGE, JSON.stringify(this.roles));
    } catch (error) {
      console.error('Failed to save roles:', error);
    }
  }

  public getRoles(): RoleDefinition[] {
    return this.roles;
  }

  public getRole(name: Role): RoleDefinition | undefined {
    return this.roles.find(role => role.name === name);
  }

  public createRole(role: RoleDefinition): void {
    const existingRole = this.getRole(role.name);
    if (existingRole) {
      throw new Error(`Role ${role.name} already exists`);
    }
    this.roles.push(role);
    this.saveRoles();
  }

  public updateRole(name: Role, updates: Partial<RoleDefinition>): RoleDefinition | undefined {
    const index = this.roles.findIndex(role => role.name === name);
    if (index !== -1) {
      this.roles[index] = { ...this.roles[index], ...updates };
      this.saveRoles();
      return this.roles[index];
    }
    return undefined;
  }

  public deleteRole(name: Role): void {
    this.roles = this.roles.filter(role => role.name !== name);
    this.saveRoles();
  }

  public getPermissionsForRole(role: Role): APIPermission[] {
    const roleDefinition = this.getRole(role);
    return roleDefinition ? roleDefinition.permissions : [];
  }

  public assignRoleToAPIKey(apiKey: APIKey, role: Role): APIKey {
    const permissions = this.getPermissionsForRole(role);
    return {
      ...apiKey,
      permissions
    };
  }

  public checkPermission(apiKey: APIKey, permission: APIPermission): boolean {
    return apiKey.permissions.includes(permission);
  }

  public checkPermissions(apiKey: APIKey, permissions: APIPermission[]): boolean {
    return permissions.every(permission => this.checkPermission(apiKey, permission));
  }

  public hasAnyPermission(apiKey: APIKey, permissions: APIPermission[]): boolean {
    return permissions.some(permission => this.checkPermission(apiKey, permission));
  }

  public validatePermissions(permissions: string[]): permissions is APIPermission[] {
    const validPermissions: APIPermission[] = [
      'read:entries',
      'write:entries',
      'read:analysis',
      'read:tags',
      'read:settings',
      'write:settings',
      'read:users',
      'write:users'
    ];

    return permissions.every(permission => 
      validPermissions.includes(permission as APIPermission)
    );
  }

  public getMissingPermissions(apiKey: APIKey, requiredPermissions: APIPermission[]): APIPermission[] {
    return requiredPermissions.filter(permission => 
      !this.checkPermission(apiKey, permission)
    );
  }

  public getPermissionDescription(permission: APIPermission): string {
    const descriptions: Record<APIPermission, string> = {
      'read:entries': 'Read journal entries',
      'write:entries': 'Create, update, or delete journal entries',
      'read:analysis': 'Read analysis results',
      'read:tags': 'Read tags',
      'read:settings': 'Read user settings',
      'write:settings': 'Update user settings',
      'read:users': 'Read user information and API keys',
      'write:users': 'Create, update, or delete users and API keys'
    };

    return descriptions[permission] || 'Unknown permission';
  }

  public getPermissionCategories(): {
    category: string;
    permissions: APIPermission[];
  }[] {
    return [
      {
        category: 'Journal',
        permissions: ['read:entries', 'write:entries']
      },
      {
        category: 'Analysis',
        permissions: ['read:analysis']
      },
      {
        category: 'Tags',
        permissions: ['read:tags']
      },
      {
        category: 'Settings',
        permissions: ['read:settings', 'write:settings']
      },
      {
        category: 'Users',
        permissions: ['read:users', 'write:users']
      }
    ];
  }
}

export const apiPermissionService = new ApiPermissionService();
