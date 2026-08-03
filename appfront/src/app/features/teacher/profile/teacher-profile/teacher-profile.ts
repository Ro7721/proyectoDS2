import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Api } from '../../../../api/api';
import { CurrentUser } from '../../../../models/auth.model';
import { updateUser, findByTeacher } from '../../../../api/functions';

@Component({
  selector: 'app-teacher-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teacher-profile.html',
})
export class TeacherProfile implements OnInit {
  user: CurrentUser | null = null;
  loading = false;
  saving = false;
  message = '';
  isError = false;
  showEditModal = false;
  courseCount = 0;
  public form: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly api: Api,
    private readonly frm: FormBuilder,
    private readonly cdm: ChangeDetectorRef
  ) {
    this.form = this.frm.group({
      firstName: ['', Validators.required],
      surName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
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
        // Load course count
        try {
          const res: any = await this.api.invoke(findByTeacher, { teacherId: this.user.idUser });
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          const courses = Array.isArray(parsed) ? parsed : (parsed.data ?? []);
          this.courseCount = courses.length;
        } catch (e) {
          console.error('Error fetching course count', e);
        }
      }
    } catch (error) {
      this.showMessage('Error al cargar el perfil', true);
    } finally {
      this.loading = false;
      this.cdm.detectChanges();
    }
  }

  openEditModal(): void {
    if (this.user) {
      this.form.patchValue({
        firstName: this.user.firstName,
        surName: this.user.surName,
        email: this.user.email,
        idUser: this.user.idUser,
        password: ''
      });
    }
    this.message = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  async saveProfile(): Promise<void> {
    if (!this.user?.idUser) return;
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.showMessage('Por favor, complete todos los campos correctamente', true);
      return;
    }
    this.saving = true;
    this.message = '';
    try {
      await this.api.invoke(updateUser, { idUser: this.user.idUser, body: this.form.value });
      this.showMessage('Perfil actualizado con éxito.', false);
      this.closeEditModal();
      this.loadProfile();
    } catch (error: any) {
      this.showMessage(error.message || 'Error al guardar los cambios', true);
    } finally {
      this.saving = false;
    }
  }

  get initials(): string {
    if (!this.user) return '?';
    return ((this.user.firstName?.charAt(0) ?? '') + (this.user.surName?.charAt(0) ?? '')).toUpperCase();
  }

  private showMessage(text: string, isError: boolean): void {
    this.message = text;
    this.isError = isError;
    setTimeout(() => this.message = '', 5000);
  }
}
