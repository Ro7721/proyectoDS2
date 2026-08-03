import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StudentProfile } from './student-profile';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Api } from '../../../../api/api';
import { updateUser } from '../../../../api/functions';
import { ChangeDetectorRef } from '@angular/core';

describe('StudentProfileComponent', () => {
  let component: StudentProfile;
  let fixture: ComponentFixture<StudentProfile>;
  let authServiceSpy: any;
  let apiSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
      getCurrentUser: vi.fn()
    };
    
    apiSpy = {
      invoke: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, StudentProfile],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Api, useValue: apiSpy },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfile);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile successfully', async () => {
    const mockUser = { idUser: '1', firstName: 'John', surName: 'Doe', email: 'john@doe.com' };
    authServiceSpy.getCurrentUser.mockResolvedValue(mockUser);

    fixture.detectChanges(); // triggers ngOnInit
    await fixture.whenStable();

    expect(component.user).toEqual(mockUser);
    expect(component.form.value.firstName).toBe('John');
    expect(component.form.value.surName).toBe('Doe');
    expect(component.form.value.email).toBe('john@doe.com');
    expect(component.loading).toBeFalsy();
  });

  it('should handle error loading profile', async () => {
    vi.useFakeTimers();
    authServiceSpy.getCurrentUser.mockRejectedValue(new Error('Auth Error'));

    fixture.detectChanges();
    await fixture.whenStable();
    vi.advanceTimersByTime(5000); // wait for setTimeout of showMessage

    expect(component.message).toBe(''); // Message resets after 5s
    expect(component.loading).toBeFalsy();
    vi.useRealTimers();
  });

  it('should open edit modal', () => {
    component.user = { idUser: '1', firstName: 'Jane', surName: 'Doe', email: 'jane@doe.com' } as any;
    
    component.openEditModal();

    expect(component.showEditModal).toBeTruthy();
    expect(component.form.value.firstName).toBe('Jane');
    expect(component.message).toBe('');
  });

  it('should close edit modal', () => {
    component.showEditModal = true;
    component.closeEditModal();
    expect(component.showEditModal).toBeFalsy();
  });

  it('should not save profile if user id is missing', async () => {
    component.user = null;
    await component.saveProfile();
    expect(apiSpy.invoke).not.toHaveBeenCalled();
  });

  it('should show message if form is invalid on save', async () => {
    component.user = { idUser: '1' } as any;
    component.form.controls['firstName'].setValue('');
    
    await component.saveProfile();
    
    expect(component.isError).toBeTruthy();
    expect(component.message).toBe('Por favor, complete todos los campos correctamente');
  });

  it('should save profile successfully and reload', async () => {
    vi.useFakeTimers();
    component.user = { idUser: '1' } as any;
    component.form.controls['firstName'].setValue('Jane');
    component.form.controls['surName'].setValue('Smith');
    component.form.controls['email'].setValue('jane@smith.com');
    component.form.controls['idUser'].setValue('1');
    
    const mockResponse = { success: true };
    apiSpy.invoke.mockResolvedValue(mockResponse);
    authServiceSpy.getCurrentUser.mockResolvedValue({ idUser: '1', firstName: 'Jane' });

    await component.saveProfile();

    expect(apiSpy.invoke).toHaveBeenCalledWith(updateUser, { idUser: '1', body: component.form.value });
    expect(component.showEditModal).toBeFalsy();
    expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });

  it('should save profile successfully (string response)', async () => {
    vi.useFakeTimers();
    component.user = { idUser: '1' } as any;
    component.form.controls['firstName'].setValue('Jane');
    component.form.controls['surName'].setValue('Smith');
    component.form.controls['email'].setValue('jane@smith.com');
    component.form.controls['idUser'].setValue('1');
    
    apiSpy.invoke.mockResolvedValue('{"success": true}');
    authServiceSpy.getCurrentUser.mockResolvedValue({ idUser: '1', firstName: 'Jane' });

    await component.saveProfile();

    expect(component.showEditModal).toBeFalsy();
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });

  it('should handle API error returning success false', async () => {
    vi.useFakeTimers();
    component.user = { idUser: '1' } as any;
    component.form.controls['firstName'].setValue('Jane');
    component.form.controls['surName'].setValue('Smith');
    component.form.controls['email'].setValue('jane@smith.com');
    component.form.controls['idUser'].setValue('1');
    
    apiSpy.invoke.mockResolvedValue({ success: false, response: { listMessage: ['Bad data'] } });

    await component.saveProfile();

    expect(component.isError).toBeTruthy();
    expect(component.message).toBe('Bad data');
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });

  it('should handle general exception on save', async () => {
    vi.useFakeTimers();
    component.user = { idUser: '1' } as any;
    component.form.controls['firstName'].setValue('Jane');
    component.form.controls['surName'].setValue('Smith');
    component.form.controls['email'].setValue('jane@smith.com');
    component.form.controls['idUser'].setValue('1');
    
    apiSpy.invoke.mockRejectedValue(new Error('Network Error'));

    await component.saveProfile();

    expect(component.isError).toBeTruthy();
    expect(component.message).toBe('Network Error');
    vi.advanceTimersByTime(5000);
    vi.useRealTimers();
  });
});
