import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../../api/api';
import { RoleEnum } from '../../../models/user.model';
import { MessageToast } from '../../../message/message-toast';
import { apicreateUser, ApicreateUser$Params } from '../../../api/functions';

@Component({
  selector: 'app-register-user',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser {

  public form: FormGroup;
  public RoleEnum = RoleEnum;
  public isRoleDropdownOpen = false;

  get firstName() { return this.form.controls['firstName']; }
  get lastName() { return this.form.controls['lastName']; }
  get email() { return this.form.controls['email']; }
  get password() { return this.form.controls['password']; }
  get confirmPassword() { return this.form.controls['confirmPassword']; }
  get role() { return this.form.controls['role']; }

  constructor(private formBuilder: FormBuilder, private api: Api, private toast: MessageToast) {
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  sendInsertUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.toastError('Error', 'Por favor, complete todos los campos correctamente');
      return;
    }

    const dataUser: ApicreateUser$Params = {
      body: {
        firstName: this.firstName.value,
        lastName: this.lastName.value,
        email: this.email.value,
        password: this.password.value,
        role: this.role.value
      }
    }

    this.api.invoke(apicreateUser, dataUser).then((response: any) => {
      const apiResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.toast.toastSuccess('Éxito', 'Usuario registrado correctamente');
      this.form.reset();
      return apiResponse;
    }).catch((error: any) => {
      this.toast.toastError('Error', 'Error al registrar el usuario');
      return error;
    })
  }

  get roles() {
    return Object.keys(this.RoleEnum).map(key => ({
      key: key,
      value: this.RoleEnum[key as keyof typeof RoleEnum]
    }));
  }

  toggleRoleDropdown() {
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
  }

  selectRole(roleKey: string) {
    this.role.setValue(roleKey);
    this.role.markAsTouched();
    this.form.markAsDirty();
    this.isRoleDropdownOpen = false;
  }

  get selectedRoleText() {
    const selected = this.roles.find(r => r.key === this.role.value);
    return selected ? selected.value : 'Seleccione un rol';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.role-dropdown-container')) {
      this.isRoleDropdownOpen = false;
    }
  }

}
