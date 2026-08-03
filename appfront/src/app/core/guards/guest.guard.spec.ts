import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { GuestGuard } from './guest.guard';

describe('GuestGuard', () => {
  let guard: GuestGuard;
  let authServiceSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    authServiceSpy = {
      isAuthenticated: vi.fn(),
      getRoleHomeUrl: vi.fn(),
      ensureAuthenticated: vi.fn(),
      refreshToken: null
    };

    routerSpy = {
      createUrlTree: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GuestGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(GuestGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return a UrlTree to role home if authenticated', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.getRoleHomeUrl.mockReturnValue(['/student/home']);
    routerSpy.createUrlTree.mockReturnValue('mockUrlTree');

    const result = guard.canActivate();

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(authServiceSpy.getRoleHomeUrl).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/student/home']);
    expect(result).toBe('mockUrlTree');
  });

  it('should return true if not authenticated and no refresh token exists', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    authServiceSpy.refreshToken = null;

    const result = guard.canActivate();

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should call resolveWithRefresh and return UrlTree if authenticated after refresh', async () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    authServiceSpy.refreshToken = 'fake_refresh_token';
    authServiceSpy.ensureAuthenticated.mockResolvedValue(true);
    authServiceSpy.getRoleHomeUrl.mockReturnValue(['/teacher/home']);
    routerSpy.createUrlTree.mockReturnValue('mockUrlTree2');

    const result = await guard.canActivate();

    expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
    expect(authServiceSpy.getRoleHomeUrl).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/teacher/home']);
    expect(result).toBe('mockUrlTree2');
  });

  it('should call resolveWithRefresh and return true if not authenticated after refresh', async () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);
    authServiceSpy.refreshToken = 'fake_refresh_token';
    authServiceSpy.ensureAuthenticated.mockResolvedValue(false);

    const result = await guard.canActivate();

    expect(authServiceSpy.ensureAuthenticated).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
