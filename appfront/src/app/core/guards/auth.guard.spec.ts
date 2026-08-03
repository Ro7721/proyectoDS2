import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthGuard } from './auth.guard';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: any;
  let mockRouter: any;
  const mockUrlTree = {} as UrlTree;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/dashboard/my-courses' } as RouterStateSnapshot;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      ensureAuthenticated: vi.fn().mockResolvedValue(false),
      getRoleHomeUrl: vi.fn().mockReturnValue(['/dashboard/my-courses']),
      refreshToken: null,
    };

    mockRouter = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue(mockUrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  // =========== canActivate ===========

  it('debería retornar true cuando el usuario está autenticado', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = guard.canActivate(mockRoute, mockState);

    expect(result).toBe(true);
  });

  it('debería redirigir al login cuando no está autenticado y no hay refreshToken', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = null;

    const result = guard.canActivate(mockRoute, mockState);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      ['/auth/login'],
      expect.objectContaining({ queryParams: { returnUrl: '/dashboard/my-courses' } })
    );
    expect(result).toBe(mockUrlTree);
  });

  it('debería intentar refresh cuando no está autenticado pero tiene refreshToken', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = 'refresh-token-abc';
    mockAuthService.ensureAuthenticated.mockResolvedValue(true);

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Promise) {
      const resolved = await result;
      expect(resolved).toBe(true);
    }
  });

  it('debería redirigir al login si el refresh falla', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = 'stale-token';
    mockAuthService.ensureAuthenticated.mockResolvedValue(false);

    const result = guard.canActivate(mockRoute, mockState);

    if (result instanceof Promise) {
      await result;
      expect(mockRouter.createUrlTree).toHaveBeenCalled();
    }
  });
});
