import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageToast } from '../../../message/message-toast';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly plataformId = inject(PLATFORM_ID);
  loading = false;

  constructor(private readonly toast: MessageToast) {

  }
  form = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.plataformId)) {

      const message2 = localStorage.getItem('access-error');
      if (message2) {
        this.toast.toastError('Error', message2);
        localStorage.removeItem('access-error');
      }
    }
  }

  async login() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.toastWarn('Advertencia', 'Por favor, complete todos los campos correctamente');
      return;
    }
    this.loading = true;

    try {

      await this.authService.login(
        this.email.value,
        this.password.value
      );

      // Si hay returnUrl, redirigir ahí en vez del dashboard
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
        return;
      }

      await this.router.navigate(this.authService.getRoleHomeUrl());

    } catch (error) {
      this.handleLoginError(error as HttpErrorResponse);
    } finally {
      this.loading = false;
    }
  }

  private handleLoginError(err: HttpErrorResponse): void {
    const apiError = this.parseErrorBody(err.error);

    if (apiError?.error) {
      const errorType = apiError.error;
      const errorMessage = apiError.message ?? 'No fue posible iniciar sesión';

      if (errorType === 'EMAIL_NOT_FOUND') {
        this.toast.toastError('Correo no encontrado', errorMessage);
      } else if (errorType === 'PASSWORD_INVALID') {
        this.toast.toastError('Credenciales inválidas', 'El correo o la contraseña no coinciden');
      } else if (errorType === 'USER_DISABLED') {
        this.toast.toastError('Cuenta inactiva', errorMessage);
      } else {
        this.toast.toastError('Error de autenticación', errorMessage);
      }
    } else if (err.status === 401) {
      this.toast.toastError('Credenciales inválidas', 'El correo o la contraseña no coinciden');
    } else if (err.status === 403) {
      this.toast.toastError('Cuenta sin acceso', 'La cuenta está inactiva o no tiene permisos para ingresar');
    } else if (err.status === 0) {
      this.toast.toastError('Servidor no disponible', 'No fue posible conectar con el servidor');
    } else {
      this.toast.toastError('Error', 'No fue posible iniciar sesión');
    }
  }

  private parseErrorBody(body: unknown): { error?: string; message?: string } | null {
    if (body && typeof body === 'object') {
      return body as { error?: string; message?: string };
    }

    if (typeof body === 'string') {
      try {
        return JSON.parse(body) as { error?: string; message?: string };
      } catch {
        return null;
      }
    }

    return null;
  }
}
