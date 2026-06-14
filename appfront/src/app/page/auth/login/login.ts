import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from "primeng/toast";

@Component({
  selector: 'app-login',
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule, ReactiveFormsModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  loading = false;

  form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50)
      ]
    ]
  });
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  private toastSuccess(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail: detail ?? '',
      life: 4000,
    });
  }

  private toastError(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: detail ?? '',
      life: 5000,
    });
  }

  private toastWarn(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: detail ?? '',
      life: 4500,
    });
  }

  async login() {
    this.form.markAllAsTouched();
    if (this.form.invalid) { return; }
    this.loading = true;

    try {

      const response = await this.authService.login(
        this.email.value,
        this.password.value
      );
      const user = response.user;
      switch (user.role) {

        case 'ROLE_TEACHER':
          await this.router.navigate([
            '/dashboard/overview-teacher'
          ]);
          break;

        case 'ROLE_ADMIN':
          await this.router.navigate([
            '/dashboard/admin'
          ]);
          break;
        case 'ROLE_STUDENT':
          await this.router.navigate([
            '/dashboard/learning'
          ]);
          break;

      }

    } catch (error) {

      const err = error as HttpErrorResponse;

      if (err.error && err.error.error) {
        const errorType = err.error.error;
        const errorMessage = err.error.message;
        if (errorType === 'EMAIL_NOT_FOUND') {
          this.toastError('correo incorrecto', errorMessage);
        } else if (errorType === 'PASSWORD_INVALID') {
          this.toastError('contraseña incorrecta', errorMessage);
        } else {
          this.toastError('error de Autenticación', errorMessage);
        }
      } else {
        if (err.status === 401) {
          this.toastError('Credinciales invalidas', 'El usuario o la contrseña no coinciden');
        } else {
          this.toastError('Error', 'No fue posible iniciar sesión');
        }
      }
    } finally {
      this.loading = false;
    }
  }
}
