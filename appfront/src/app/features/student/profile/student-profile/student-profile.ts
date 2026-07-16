import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Api } from '../../../../api/api';
import { CurrentUser } from '../../../../models/auth.model';
import { apiUserUpdate } from '../../../../api/functions';

@Component({
  selector: 'app-student-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfile implements OnInit {
  user: CurrentUser | null = null;
  loading = false;
  saving = false;
  message = '';
  isError = false;
  public form: FormGroup;

  constructor(
    private authService: AuthService,
    private api: Api,
    private frm: FormBuilder
  ) {
    this.form = this.frm.group({
      firstName: ['', Validators.required],
      surName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      idUser: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading = true;
    try {
      this.user = await this.authService.getCurrentUser();
      if (this.user) {
        this.form.patchValue({
          firstName: this.user.firstName,
          surName: this.user.surName,
          email: this.user.email,
          idUser: this.user.idUser
        });
      }
    } catch (error) {
      console.error('Error loading profile', error);
      this.showMessage('Error al cargar el perfil', true);
    } finally {
      this.loading = false;
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.user || !this.user.idUser) return;

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.showMessage('Por favor, complete todos los campos correctamente', true);
      return;
    }

    this.saving = true;
    this.message = '';

    try {
      this.api.invoke(apiUserUpdate, { idUser: this.user.idUser, body: this.form.value }).then((response: any) => {
        const apiResponse = typeof response === 'string' ? JSON.parse(response) : response;

        if (!apiResponse.success) {
          throw new Error(apiResponse.response?.listMessage?.[0] || 'Error al actualizar');
        }
        this.showMessage('Perfil actualizado con éxito.', false);
        this.form.patchValue({
          password: '',
          confirmPassword: ''
        });
      }).catch((error: any) => {
        console.error('Error saving profile', error);
        this.showMessage(error.message || 'Error al guardar los cambios', true);
      }).finally(() => {
        this.saving = false;
      })

    } catch (error: any) {
      console.error('Error saving profile', error);
      this.showMessage(error.message || 'Error al guardar los cambios', true);
    } finally {
      this.saving = false;
    }
  }

  private showMessage(text: string, isError: boolean): void {
    this.message = text;
    this.isError = isError;
    setTimeout(() => this.message = '', 5000);
  }
}
