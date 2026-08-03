import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MessageToast } from '../../../message/message-toast';
import { MessageService } from 'primeng/api';
import { PLATFORM_ID } from '@angular/core';

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: any;
  let routerSpy: any;
  let messageToastSpy: any;
  let mockActivatedRoute: any;
  let mockMessageService: any;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn(),
      getRoleHomeUrl: vi.fn().mockReturnValue(['/home'])
    };
    
    routerSpy = {
      navigateByUrl: vi.fn(),
      navigate: vi.fn()
    };
    
    messageToastSpy = {
      toastWarn: vi.fn(),
      toastError: vi.fn()
    };
    
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: {
          get: vi.fn()
        }
      }
    };

    mockMessageService = {
      add: vi.fn()
    };

    // Mock localStorage
    const store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key in store) {
          delete store[key];
        }
      }
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, Login],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        MessageService,
        { provide: MessageToast, useValue: messageToastSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and show access-error from localStorage if present', () => {
    window.localStorage.setItem('access-error', 'Test error');
    
    component.ngOnInit();
    
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error', 'Test error');
    expect(window.localStorage.getItem('access-error')).toBeNull();
  });

  it('should show warning if form is invalid', async () => {
    component.form.controls.email.setValue('');
    component.form.controls.password.setValue('');
    
    await component.login();
    
    expect(messageToastSpy.toastWarn).toHaveBeenCalledWith('Advertencia', 'Por favor, complete todos los campos correctamente');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should login and navigate to returnUrl if present', async () => {
    component.form.controls.email.setValue('test@test.com');
    component.form.controls.password.setValue('123456');
    authServiceSpy.login.mockResolvedValue(true);
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue('/some-url');
    
    await component.login();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', '123456');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/some-url');
  });

  it('should login and navigate to role home url if returnUrl is not present', async () => {
    component.form.controls.email.setValue('test@test.com');
    component.form.controls.password.setValue('123456');
    authServiceSpy.login.mockResolvedValue(true);
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue(null);
    
    await component.login();
    
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', '123456');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle login error with specific message from API', async () => {
    component.form.controls.email.setValue('test@test.com');
    component.form.controls.password.setValue('123456');
    
    const mockError = {
      error: {
        error: 'EMAIL_NOT_FOUND',
        message: 'Email missing'
      }
    };
    authServiceSpy.login.mockRejectedValue(mockError);
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue(null);
    
    await component.login();
    
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Correo no encontrado', 'Email missing');
  });

  it('should handle login error with 401 status', async () => {
    component.form.controls.email.setValue('test@test.com');
    component.form.controls.password.setValue('123456');
    
    const mockError = { status: 401 };
    authServiceSpy.login.mockRejectedValue(mockError);
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue(null);
    
    await component.login();
    
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Credenciales inválidas', 'El usuario o la contraseña no coinciden');
  });

  it('should handle generic login error', async () => {
    component.form.controls.email.setValue('test@test.com');
    component.form.controls.password.setValue('123456');
    
    const mockError = new Error('Unknown error');
    authServiceSpy.login.mockRejectedValue(mockError);
    mockActivatedRoute.snapshot.queryParamMap.get.mockReturnValue(null);
    
    await component.login();
    
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error', 'No fue posible iniciar sesión');
  });
});
