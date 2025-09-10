export interface AuthConfig {
  jwtSecret?: string;
  saltRounds?: number;
  defaultTokenExpiry?: string;
  rolesConfig?: Record<string, { can: string[] }>;
}

export interface UserPayload {
  id: string;
  role: string;
  [key: string]: any; // Allow additional properties
}

export interface RBACPermission {
  action: string;
  resource: string;
}

export interface RBACConfig {
  [role: string]: {
    can: RBACPermission[];
  };
}