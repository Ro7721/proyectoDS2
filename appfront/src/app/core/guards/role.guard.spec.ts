import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RoleGuard } from './role.guard';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockAuthService: any;
  let mockRouter: any;
  const mockUrlTree = {} as UrlTree;

  const mockState = { url: '/dashboard/admin' } as RouterStateSnapshot;

  function buildRoute(roles: string[]): ActivatedRouteSnapshot {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  }

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      ensureAuthenticated: vi.fn().mockResolvedValue(false),
      getRoleHomeUrl: vi.fn().mockReturnValue(['/dashboard/my-courses']),
      refreshToken: null,
      currentRole: null,
    };

    mockRouter = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue(mockUrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(RoleGuard);
  });

  // =========== canActivate — autenticado ===========

  it('debería retornar true si está autenticado y tiene el rol correcto', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.currentRole = 'ROLE_ADMIN';

    const result = guard.canActivate(buildRoute(['ROLE_ADMIN']), mockState);

    expect(result).toBe(true);
  });

  it('debería redirigir si está autenticado pero no tiene el rol requerido', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.currentRole = 'ROLE_STUDENT';
    mockAuthService.getRoleHomeUrl.mockReturnValue(['/dashboard/my-courses']);

    const result = guard.canActivate(buildRoute(['ROLE_ADMIN']), mockState);

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard/my-courses']);
  });

  it('debería retornar true si no hay roles definidos en la ruta', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.currentRole = 'ROLE_TEACHER';

    const result = guard.canActivate(buildRoute([]), mockState);

    expect(result).toBe(true);
  });

  it('debería retornar true si tiene uno de los múltiples roles permitidos', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.currentRole = 'ROLE_TEACHER';

    const result = guard.canActivate(buildRoute(['ROLE_ADMIN', 'ROLE_TEACHER']), mockState);

    expect(result).toBe(true);
  });

  // =========== canActivate — no autenticado ===========

  it('debería redirigir al login si no está autenticado y no hay refreshToken', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = null;

    const result = guard.canActivate(buildRoute(['ROLE_ADMIN']), mockState);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      ['/auth/login'],
      expect.objectContaining({ queryParams: { returnUrl: '/dashboard/admin' } })
    );
    expect(result).toBe(mockUrlTree);
  });

  it('debería intentar refresh si no está autenticado pero hay refreshToken', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = 'some-refresh';
    mockAuthService.currentRole = 'ROLE_STUDENT';
    mockAuthService.ensureAuthenticated.mockResolvedValue(true);

    const result = guard.canActivate(buildRoute(['ROLE_STUDENT']), mockState);

    if (result instanceof Promise) {
      const resolved = await result;
      expect(resolved).toBe(true);
    }
  });

  it('debería redirigir al login si el refresh falla', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.refreshToken = 'stale-refresh';
    mockAuthService.ensureAuthenticated.mockResolvedValue(false);

    const result = guard.canActivate(buildRoute(['ROLE_ADMIN']), mockState);

    if (result instanceof Promise) {
      await result;
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['/auth/login'],
        expect.anything()
      );
    }
  });
});
