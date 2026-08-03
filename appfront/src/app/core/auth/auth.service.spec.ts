import { TestBed } from '@angular/core/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Api } from '../../api/api';
import { PLATFORM_ID } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;

  // JWT de prueba con exp en el futuro (año 2099)
  const validJwt = (() => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const exp = Math.floor(new Date('2099-01-01').getTime() / 1000);
    const payload = btoa(
      JSON.stringify({ sub: 'test@test.com', exp, role: 'ROLE_STUDENT' })
    ).replace(/=/g, '');
    const sig = btoa('fakesig');
    return `${header}.${payload}.${sig}`;
  })();

  // JWT de prueba con exp en el pasado
  const expiredJwt = (() => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const exp = Math.floor(new Date('2000-01-01').getTime() / 1000);
    const payload = btoa(
      JSON.stringify({ sub: 'test@test.com', exp, role: 'ROLE_STUDENT' })
    ).replace(/=/g, '');
    const sig = btoa('fakesig');
    return `${header}.${payload}.${sig}`;
  })();

  const mockRouter = {
    navigate: vi.fn(),
    createUrlTree: vi.fn().mockReturnValue({}),
  };

  const mockApi = {
    invoke: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: Api, useValue: mockApi },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // =========== isAuthenticated ===========

  it('debería retornar false cuando no hay token', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('debería retornar true con token válido', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.isAuthenticated()).toBeTruthy();
  });

  it('debería retornar false con token expirado', () => {
    localStorage.setItem('accessToken', expiredJwt);
    expect(service.isAuthenticated()).toBeFalsy();
  });

  // =========== accessToken ===========

  it('debería retornar null cuando no hay accessToken', () => {
    expect(service.accessToken).toBeNull();
  });

  it('debería retornar el accessToken almacenado', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.accessToken).toBe(validJwt);
  });

  // =========== refreshToken ===========

  it('debería retornar null cuando no hay refreshToken', () => {
    expect(service.refreshToken).toBeNull();
  });

  it('debería retornar el refreshToken almacenado', () => {
    localStorage.setItem('refreshToken', 'refresh-abc');
    expect(service.refreshToken).toBe('refresh-abc');
  });

  // =========== currentRole ===========

  it('debería retornar ROLE_STUDENT del JWT decodificado', () => {
    localStorage.setItem('accessToken', validJwt);
    const role = service.currentRole;
    expect(role).toBe('ROLE_STUDENT');
  });

  it('debería retornar null si no hay token ni rol almacenado', () => {
    expect(service.currentRole).toBeNull();
  });

  it('debería retornar el rol del localStorage si no hay token', () => {
    localStorage.setItem('role', 'ROLE_ADMIN');
    expect(service.currentRole).toBe('ROLE_ADMIN');
  });

  // =========== isLoggedIn ===========

  it('isLoggedIn debería ser true con token válido', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.isLoggedIn).toBeTruthy();
  });

  it('isLoggedIn debería ser false sin token', () => {
    expect(service.isLoggedIn).toBeFalsy();
  });

  // =========== isStudent / isTeacher ===========

  it('isStudent debería ser true cuando rol es ROLE_STUDENT', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.isStudent()).toBe(true);
  });

  it('isTeacher debería ser false cuando rol es ROLE_STUDENT', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.isTeacher()).toBe(false);
  });

  // =========== hasAnyRole ===========

  it('hasAnyRole debería retornar true si tiene el rol requerido', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.hasAnyRole(['ROLE_STUDENT'])).toBe(true);
  });

  it('hasAnyRole debería retornar false si no tiene el rol requerido', () => {
    localStorage.setItem('accessToken', validJwt);
    expect(service.hasAnyRole(['ROLE_ADMIN'])).toBe(false);
  });

  it('hasAnyRole debería retornar true con lista vacía de roles', () => {
    expect(service.hasAnyRole([])).toBe(true);
  });

  it('hasAnyRole debería retornar false sin rol actual', () => {
    expect(service.hasAnyRole(['ROLE_ADMIN'])).toBe(false);
  });

  // =========== getRoleHomeUrl ===========

  it('debería retornar URL del admin para ROLE_ADMIN', () => {
    expect(service.getRoleHomeUrl('ROLE_ADMIN')).toEqual(['/dashboard/admin']);
  });

  it('debería retornar URL del teacher para ROLE_TEACHER', () => {
    expect(service.getRoleHomeUrl('ROLE_TEACHER')).toEqual(['/dashboard/overview-teacher']);
  });

  it('debería retornar URL del student para ROLE_STUDENT', () => {
    expect(service.getRoleHomeUrl('ROLE_STUDENT')).toEqual(['/dashboard/my-courses']);
  });

  it('debería retornar login para rol nulo', () => {
    expect(service.getRoleHomeUrl(null)).toEqual(['/auth/login']);
  });

  // =========== getTokenType ===========

  it('getTokenType debería retornar Bearer por defecto', () => {
    expect(service.getTokenType()).toBe('Bearer');
  });

  it('getTokenType debería retornar el valor almacenado', () => {
    localStorage.setItem('tokenType', 'Bearer');
    expect(service.getTokenType()).toBe('Bearer');
  });

  // =========== logout ===========

  it('logout debería limpiar localStorage y navegar', () => {
    localStorage.setItem('accessToken', validJwt);
    localStorage.setItem('refreshToken', 'refresh-abc');
    localStorage.setItem('user', JSON.stringify({ id: '1' }));

    service.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['']);
  });

  // =========== user getter ===========

  it('user debería retornar null si no hay datos', () => {
    expect(service.user).toBeNull();
  });

  it('user debería retornar el objeto de usuario almacenado', () => {
    const userData = { id: '1', firstName: 'Juan', role: 'ROLE_STUDENT' };
    localStorage.setItem('user', JSON.stringify(userData));
    const user = service.user;
    expect(user).toBeTruthy();
  });
});
