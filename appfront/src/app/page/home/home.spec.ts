import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Home } from './home';
import { Api } from '../../api/api';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { getPublicCourses } from '../../api/functions';
import { ChangeDetectorRef } from '@angular/core';

describe('HomeComponent', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let apiSpy: any;
  let messageServiceSpy: any;
  let authServiceSpy: any;
  let themeServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    apiSpy = {
      invoke: vi.fn()
    };
    
    messageServiceSpy = {
      add: vi.fn()
    };
    
    authServiceSpy = {
      isAuthenticated: vi.fn(),
      getRoleHomeUrl: vi.fn(),
      logout: vi.fn(),
      currentRole: null
    };

    themeServiceSpy = {
      toggleTheme: vi.fn(),
      isDark: signal(false)
    };

    routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Api, useValue: apiSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'browser' },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load public courses on init if platform is browser', async () => {
    const mockCourses = [{ idCourse: '1', title: 'Course 1' }];
    apiSpy.invoke.mockResolvedValue({ data: mockCourses });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(apiSpy.invoke).toHaveBeenCalledWith(getPublicCourses);
    expect(component.publicCourses).toEqual(mockCourses);
    expect(component.loadingCourses).toBeFalsy();
    expect(component.coursesLoadError).toBeFalsy();
  });

  it('should handle load public courses error', async () => {
    apiSpy.invoke.mockRejectedValue(new Error('Network error'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los cursos públicos',
      life: 5000,
    });
    expect(component.publicCourses).toEqual([]);
    expect(component.loadingCourses).toBeFalsy();
    expect(component.coursesLoadError).toBeTruthy();
  });

  it('should not load courses if platform is not browser', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Api, useValue: apiSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: PLATFORM_ID, useValue: 'server' }, // Set to server
        ChangeDetectorRef
      ]
    });
    
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    
    fixture.detectChanges();

    expect(apiSpy.invoke).not.toHaveBeenCalled();
    expect(component.loadingCourses).toBeFalsy();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalsy();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTruthy();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalsy();
  });

  it('should toggle profile', () => {
    expect(component.profileOpen).toBeFalsy();
    component.toggleProfile();
    expect(component.profileOpen).toBeTruthy();
    component.toggleProfile();
    expect(component.profileOpen).toBeFalsy();
  });

  it('should close profile on outside document click', () => {
    component.profileOpen = true;
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(null)
      }
    } as unknown as Event;

    component.onDocumentClick(mockEvent);

    expect(component.profileOpen).toBeFalsy();
  });

  it('should keep profile open on inside document click', () => {
    component.profileOpen = true;
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(true)
      }
    } as unknown as Event;

    component.onDocumentClick(mockEvent);

    expect(component.profileOpen).toBeTruthy();
  });

  it('should go to dashboard login if not authenticated', () => {
    component.profileOpen = true;
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    component.goToDashboard();

    expect(component.profileOpen).toBeFalsy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/' } });
  });

  it('should go to role dashboard if authenticated', () => {
    component.profileOpen = true;
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.getRoleHomeUrl.mockReturnValue(['/student/home']);

    component.goToDashboard();

    expect(component.profileOpen).toBeFalsy();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/home']);
  });

  it('should return correct dashboard label for roles', () => {
    authServiceSpy.currentRole = 'ROLE_ADMIN';
    expect(component.dashboardLabel).toBe('Gestión');

    authServiceSpy.currentRole = 'ROLE_TEACHER';
    expect(component.dashboardLabel).toBe('Panel Docente');

    authServiceSpy.currentRole = 'ROLE_STUDENT';
    expect(component.dashboardLabel).toBe('Mis Cursos');

    authServiceSpy.currentRole = null;
    expect(component.dashboardLabel).toBe('Mis Cursos');
  });

  it('should return correct dashboard icon for roles', () => {
    authServiceSpy.currentRole = 'ROLE_ADMIN';
    expect(component.dashboardIcon).toBe('admin_panel_settings');

    authServiceSpy.currentRole = 'ROLE_TEACHER';
    expect(component.dashboardIcon).toBe('dashboard');

    authServiceSpy.currentRole = 'ROLE_STUDENT';
    expect(component.dashboardIcon).toBe('school');

    authServiceSpy.currentRole = null;
    expect(component.dashboardIcon).toBe('school');
  });

  it('should logout and close profile', () => {
    component.profileOpen = true;
    
    component.logout();

    expect(component.profileOpen).toBeFalsy();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
