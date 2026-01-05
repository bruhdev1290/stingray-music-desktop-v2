import type { StingrayAuthTokens } from './types';

const TOKEN_KEY = 'stingray_auth_token';
const REFRESH_TOKEN_KEY = 'stingray_refresh_token';
const TOKEN_EXPIRY_KEY = 'stingray_token_expiry';
const USERNAME_KEY = 'stingray_username';

export class SecureStorage {
  static setTokens(tokens: StingrayAuthTokens): void {
    localStorage.setItem(TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    if (tokens.expiresIn) {
      const expiryTime = Date.now() + tokens.expiresIn * 1000;
      localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static getTokenExpiry(): number | null {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) {
      return true;
    }
    return Date.now() > expiry;
  }

  static setUsername(username: string): void {
    localStorage.setItem(USERNAME_KEY, username);
  }

  static getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }

  static hasValidToken(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }
}
