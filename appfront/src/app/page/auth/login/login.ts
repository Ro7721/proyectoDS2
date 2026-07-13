import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from "primeng/toast";
import { MessageToast } from '../../../message/message-toast';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule, ReactiveFormsModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private plataformId = inject(PLATFORM_ID);
  loading = false;

  constructor(private toast: MessageToast) {

  }
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.plataformId)) {
      const message = localStorage.getItem('logoutMessage');
      if (message) {
        this.toast.toastSuccess('Éxito', message);
        localStorage.removeItem('logoutMessage');
      }

      const message2 = localStorage.getItem('access-error');
      if (message2) {
        this.toast.toastError('Error', message2);
        localStorage.removeItem('access-error');
      }
    }
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

      // Si hay returnUrl, redirigir ahí en vez del dashboard
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
        return;
      }

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
            '/dashboard/my-courses'
          ]);
          break;

      }

    } catch (error) {

      const err = error as HttpErrorResponse;

      if (err.error && err.error.error) {
        const errorType = err.error.error;
        const errorMessage = err.error.message;
        if (errorType === 'EMAIL_NOT_FOUND') {
          this.toast.toastError('Correo no encontrado', errorMessage);
        } else if (errorType === 'PASSWORD_INVALID') {
          this.toast.toastError('Contraseña incorrecta', errorMessage);
        } else {
          this.toast.toastError('Error de autenticación', errorMessage);
        }
      } else {
        if (err.status === 401) {
          this.toast.toastError('Credenciales inválidas', 'El usuario o la contraseña no coinciden');
        } else {
          this.toast.toastError('Error', 'No fue posible iniciar sesión');
        }
      }
    } finally {
      this.loading = false;
    }
  }
}

