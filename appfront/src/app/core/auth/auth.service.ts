import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../api/api';
import { isPlatformBrowser } from '@angular/common';
import { CurrentUser, LoginResponse, RefreshTokenResponse } from '../../models/auth.model';
import { login, Login$Params, me, Me$Params, refreshToken, RefreshToken$Params } from '../../api/functions';

export type AppRole = 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_STUDENT';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private plataformId = inject(PLATFORM_ID);
  private isBrowser = () => isPlatformBrowser(this.plataformId);

  constructor(private api: Api) { }

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('Antes del login');
    const response = await this.api.invoke<Login$Params, LoginResponse>(login, {
      body: {
        email,
        password
      }
    });
    console.log('Respuesta login:', response);
    this.saveSession(response);
    return response;
  }
  async getCurrentUser(): Promise<CurrentUser> {
    const response = await this.api.invoke<
      Me$Params,
      CurrentUser
    >(me, {});
    return response;
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (this.isAuthenticated()) return true;
    if (!this.refreshToken) return false;

    try {
      const response = await this.refreshAccessToken();
      return Boolean(response?.accessToken);
    } catch {
      this.clearSession();
      return false;
    }
  }

  async refreshAccessToken(): Promise<RefreshTokenResponse | null> {
    const storedRefreshToken = this.refreshToken;
    if (!storedRefreshToken) return null;

    const response = await this.api.invoke<RefreshToken$Params, RefreshTokenResponse>(refreshToken, {
      body: { refreshToken: storedRefreshToken },
    });

    if (this.isBrowser()) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('expiresIn', String(response.expiresIn));
      localStorage.setItem('tokenType', response.tokenType);
      this.saveTokenExpiration(response.accessToken);
    }

    return response;
  }

  logout(): void {
    localStorage.setItem('logoutMessage', 'sesion cerrada correctamente');
    this.clearSession();

    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = this.accessToken;
    return Boolean(token && !this.isTokenExpired(token));
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    if (allowedRoles.length === 0) return true;

    const currentRole = this.currentRole;
    if (!currentRole) return false;

    return allowedRoles
      .map((role) => this.normalizeRole(role))
      .includes(currentRole);
  }

  get accessToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('accessToken') : null;
  }

  get refreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem('refreshToken') : null;
  }

  get user(): LoginResponse['user'] | null {
    if (!this.isBrowser()) return null;

    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  get currentRole(): AppRole | null {
    if (!this.isBrowser()) return null;

    const storedRole = localStorage.getItem('role');
    if (storedRole) return this.normalizeRole(storedRole);

    const userRole = this.user?.role;
    return userRole ? this.normalizeRole(userRole) : null;
  }

  getTokenType(): string {
    return this.isBrowser() ? (localStorage.getItem('tokenType') ?? 'Bearer') : 'Bearer';
  }

  private saveSession(response: LoginResponse): void {
    if (!response?.accessToken) {
      throw new Error('Token inválido');
    }
    if (!this.isBrowser()) return;

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('expiresIn', String(response.expiresIn));
    localStorage.setItem('tokenType', response.tokenType);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('role', this.normalizeRole(response.user.role));
    this.saveTokenExpiration(response.accessToken);
  }

  private clearSession(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }

  private normalizeRole(role: string): AppRole {
    const normalized = role.trim().toUpperCase().replace(/^ROLE_/, '');
    const roleMap: Record<string, AppRole> = {
      ADMIN: 'ROLE_ADMIN',
      ADMINISTRADOR: 'ROLE_ADMIN',
      TEACHER: 'ROLE_TEACHER',
      PROFESOR: 'ROLE_TEACHER',
      DOCENTE: 'ROLE_TEACHER',
      STUDENT: 'ROLE_STUDENT',
      ALUMNO: 'ROLE_STUDENT',
      ESTUDIANTE: 'ROLE_STUDENT',
    };

    return roleMap[normalized] ?? 'ROLE_STUDENT';
  }

  private saveTokenExpiration(token: string): void {
    if (!this.isBrowser()) return;

    const exp = this.getTokenExpiration(token);
    if (exp) {
      localStorage.setItem('tokenExpiresAt', String(exp.getTime()));
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;

    return expiration.getTime() <= Date.now();
  }

  private getTokenExpiration(token: string): Date | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return null;

    return new Date(payload.exp * 1000);
  }

  private decodeJwtPayload(token: string): { exp?: number } | null {
    if (!this.isBrowser()) return null;

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
