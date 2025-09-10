class RBAC {
  private roles: Record<string, { can: string[] }>;

  constructor(rolesConfig: Record<string, { can: string[] }> = {}) {
    this.roles = rolesConfig;
  }

  can(role: string) {
    return {
      perform: (action: string, resource?: string) => {
        if (!this.roles[role]) {
          return false;
        }

        const permissions = this.roles[role].can || [];
        const requiredPermission = resource ? `${action}:${resource}` : action;

        return permissions.includes(requiredPermission) || 
               permissions.includes(`${action}:*`) ||
               permissions.includes('*');
      }
    };
  }

  getPermissions(role: string): string[] {
    return this.roles[role]?.can || [];
  }

  addRole(role: string, permissions: string[]): void {
    this.roles[role] = { can: permissions };
  }

  removeRole(role: string): void {
    delete this.roles[role];
  }
}

export default RBAC;