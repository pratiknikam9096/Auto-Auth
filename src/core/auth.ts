import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RBAC from './rbac';
import { AuthConfig, UserPayload } from './types';

export function initAuth(config: AuthConfig): Auth {
  return new Auth(config);
}

export class Auth {
  private jwtSecret: string;
  private saltRounds: number;
  private defaultTokenExpiry: string;
  private rbac: RBAC;

  constructor(config: AuthConfig) {
    this.jwtSecret = config.jwtSecret || 'default-secret';
    this.saltRounds = config.saltRounds || 10;
    this.defaultTokenExpiry = config.defaultTokenExpiry || '1h';
    this.rbac = new RBAC(config.rolesConfig || {});
  }

  async hashPassword(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  generateToken(payload: UserPayload, expiresIn?: string): string {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    return jwt.sign(
      payload as object,
      this.jwtSecret as string,
      { expiresIn: expiresIn || this.defaultTokenExpiry } as jwt.SignOptions
    );
  }

  verifyToken(token: string): UserPayload | null {
    if (!token) {
      return null;
    }
    
    try {
      return jwt.verify(token, this.jwtSecret) as UserPayload;
    } catch (error) {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.verifyToken(token);
    if (!decoded) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  refreshToken(token: string, expiresIn?: string): string | null {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const { iat, exp, ...payload } = decoded;
    
    return this.generateToken(payload, expiresIn);
  }
}