import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RegisterUser } from './register-user';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Api } from '../../../api/api';
import { MessageToast } from '../../../message/message-toast';
import { createUser } from '../../../api/functions';
import { MessageService } from 'primeng/api';

describe('RegisterUserComponent', () => {
  let component: RegisterUser;
  let fixture: ComponentFixture<RegisterUser>;
  let apiSpy: any;
  let routerSpy: any;
  let messageToastSpy: any;

  beforeEach(async () => {
    apiSpy = {
      invoke: vi.fn()
    };
    
    routerSpy = {
      navigate: vi.fn()
    };
    
    messageToastSpy = {
      toastError: vi.fn(),
      toastSuccess: vi.fn()
    };

    const messageServiceSpy = {
      add: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RegisterUser],
      providers: [
        { provide: Api, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: MessageToast, useValue: messageToastSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    expect(component.form).toBeDefined();
    expect(component.form.invalid).toBeTruthy();
    expect(component.firstName.value).toBe('');
    expect(component.role.value).toBe('');
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalsy();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTruthy();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalsy();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTruthy();
  });

  it('should toggle role dropdown', () => {
    expect(component.isRoleDropdownOpen).toBeFalsy();
    component.toggleRoleDropdown();
    expect(component.isRoleDropdownOpen).toBeTruthy();
  });

  it('should select role and close dropdown', () => {
    component.isRoleDropdownOpen = true;
    component.selectRole('ROLE_STUDENT');
    expect(component.role.value).toBe('ROLE_STUDENT');
    expect(component.isRoleDropdownOpen).toBeFalsy();
  });

  it('should get correct selectedRoleText', () => {
    expect(component.selectedRoleText).toBe('Seleccione un rol');
    component.selectRole('ROLE_STUDENT');
    expect(component.selectedRoleText).toBe('ESTUDIANTE');
  });

  it('should close dropdown on document click outside', () => {
    component.isRoleDropdownOpen = true;
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(null)
      }
    } as unknown as Event;
    component.onDocumentClick(mockEvent);
    expect(component.isRoleDropdownOpen).toBeFalsy();
  });

  it('should keep dropdown open on document click inside', () => {
    component.isRoleDropdownOpen = true;
    const mockEvent = {
      target: {
        closest: vi.fn().mockReturnValue(true)
      }
    } as unknown as Event;
    component.onDocumentClick(mockEvent);
    expect(component.isRoleDropdownOpen).toBeTruthy();
  });

  it('should validate strong password correctly', () => {
    component.password.setValue('weak');
    expect(component.passwordError).toBeTruthy();

    component.password.setValue('Strong1!');
    expect(component.passwordError).toBeFalsy();
  });

  it('should return null for empty password in validator', () => {
    component.password.setValue('');
    expect(component.passwordError).toBeFalsy(); 
  });

  it('should validate firstName and lastName patterns correctly', () => {
    component.firstName.setValue('Juan');
    expect(component.firstName.valid).toBeTruthy();
    component.lastName.setValue('Salas');
    expect(component.lastName.valid).toBeTruthy();

    component.firstName.setValue('María José');
    expect(component.firstName.valid).toBeTruthy();
    component.lastName.setValue('Álvarez-Gómez');
    expect(component.lastName.valid).toBeTruthy();

    component.firstName.setValue('Juan123');
    expect(component.firstName.hasError('pattern')).toBeTruthy();
    component.lastName.setValue('Salas456');
    expect(component.lastName.hasError('pattern')).toBeTruthy();

    component.firstName.setValue('12345');
    expect(component.firstName.hasError('pattern')).toBeTruthy();
  });

  it('should show error toast if form is invalid on submit', () => {
    component.sendInsertUser();
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error', 'Por favor, complete todos los campos correctamente');
    expect(apiSpy.invoke).not.toHaveBeenCalled();
  });

  it('should call api and navigate on success', async () => {
    fixture.destroy();

    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: any) => {
      fn();
      return 0 as any;
    });

    component.firstName.setValue('Test');
    component.lastName.setValue('User');
    component.email.setValue('test@test.com');
    component.password.setValue('Strong1!');
    component.confirmPassword.setValue('Strong1!');
    component.role.setValue('ROLE_STUDENT');
    
    apiSpy.invoke.mockResolvedValue('{"success": true}');

    component.sendInsertUser();
    
    expect(apiSpy.invoke).toHaveBeenCalledWith(createUser, {
      body: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'Strong1!',
        role: 'ROLE_STUDENT'
      }
    });

    await Promise.resolve();

    expect(messageToastSpy.toastSuccess).toHaveBeenCalledWith('Éxito', 'Usuario registrado correctamente');
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1500);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);

    setTimeoutSpy.mockRestore();
  });

  it('should handle api error on submit', async () => {
    fixture.destroy();

    component.firstName.setValue('Test');
    component.lastName.setValue('User');
    component.email.setValue('test@test.com');
    component.password.setValue('Strong1!');
    component.confirmPassword.setValue('Strong1!');
    component.role.setValue('ROLE_STUDENT');
    
    apiSpy.invoke.mockRejectedValue(new Error('Network error'));

    component.sendInsertUser();
    
    await Promise.resolve();

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error', 'Error al registrar el usuario');
  });
});
