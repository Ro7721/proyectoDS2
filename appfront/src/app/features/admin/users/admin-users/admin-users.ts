import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Api } from '../../../../api/api';
import { getAllUsers, deleteUser, updateUser } from '../../../../api/functions';
import { activateUser } from '../../../../api/fn/user-controller/activate-user';
import { deactivateUser } from '../../../../api/fn/user-controller/deactivate-user';
import { changeRole } from '../../../../api/fn/user-controller/change-role';
import { UserResponse } from '../../../../api/models/user-response';
import { UserRequest } from '../../../../api/models/user-request';
import { MessageToast } from '../../../../message/message-toast';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  loading = true;
  searchQuery = '';
  filterRole = '';
  filterStatus = '';

  // Modals
  showEditModal = false;
  showDeleteModal = false;
  showRoleModal = false;

  editingUser: UserResponse | null = null;
  editForm!: FormGroup;

  userToDelete: UserResponse | null = null;
  userToChangeRole: UserResponse | null = null;
  newRole: 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_STUDENT' = 'ROLE_STUDENT';
  actionLoading = false;

  constructor(
    private api: Api,
    private fb: FormBuilder,
    private toast: MessageToast,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    Promise.resolve().then(() => this.loadUsers());
  }

  initForm() {
    this.editForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      surName:   ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [this.optionalStrongPassword()]]
    });
  }

  // Validators
  optionalStrongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val || val === '') return null; // opcional cuando se edita
      if (val === '___NOCHANGE___') return null;
      const hasMin = val.length >= 8;
      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNum = /\d/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      if (hasMin && hasUpper && hasLower && hasNum && hasSpecial) return null;
      return { strongPassword: { hasMin, hasUpper, hasLower, hasNum, hasSpecial } };
    };
  }

  get f() { return this.editForm.controls; }
  get passwordError() { return this.f['password'].errors?.['strongPassword']; }

  loadUsers() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.invoke(getAllUsers).then((response: any) => {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (Array.isArray(parsed)) {
        this.users = parsed;
      } else if (parsed.data) {
        this.users = parsed.data;
      } else {
        this.users = [];
      }
      this.applyFilters();
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cargar la lista de usuarios');
      console.error(err);
    }).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    let result = [...this.users];
    const q = this.searchQuery.toLowerCase();
    if (q) {
      result = result.filter(u =>
        (u.firstName?.toLowerCase() || '').includes(q) ||
        (u.surName?.toLowerCase() || '').includes(q) ||
        (u.email?.toLowerCase() || '').includes(q)
      );
    }
    if (this.filterRole) {
      result = result.filter(u => u.role === this.filterRole);
    }
    if (this.filterStatus !== '') {
      const isActive = this.filterStatus === 'true';
      result = result.filter(u => u.active === isActive);
    }
    this.filteredUsers = result;
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
  onFilterRole(event: Event) {
    this.filterRole = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  onFilterStatus(event: Event) {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
  clearFilters() {
    this.searchQuery = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  // Toggle activate/deactivate
  toggleStatus(user: UserResponse) {
    if (!user.idUser || this.actionLoading) return;
    this.actionLoading = true;
    const fn = user.active ? deactivateUser : activateUser;
    this.api.invoke(fn, { idUser: user.idUser }).then(() => {
      user.active = !user.active;
      this.toast.toastSuccess('Éxito', user.active ? 'Usuario activado' : 'Usuario desactivado');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cambiar el estado del usuario');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  // Edit modal
  openEditModal(user: UserResponse) {
    this.editingUser = user;
    this.editForm.reset();
    this.editForm.patchValue({
      firstName: user.firstName || '',
      surName: user.surName || '',
      email: user.email || '',
      password: ''
    });
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingUser = null;
    this.editForm.reset();
  }

  saveEdit() {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) {
      this.toast.toastWarn('Formulario inválido', 'Por favor, corrija los errores antes de guardar');
      return;
    }
    if (!this.editingUser?.idUser) return;

    this.actionLoading = true;
    const { firstName, surName, email, password } = this.editForm.value;
    const request: UserRequest = {
      firstName,
      lastName: surName,
      email,
      role: this.editingUser.role as any,
      password: password || '___NOCHANGE___'
    };

    this.api.invoke(updateUser, { idUser: this.editingUser.idUser, body: request }).then((resp: any) => {
      const parsed = typeof resp === 'string' ? JSON.parse(resp) : resp;
      const updated = parsed.data || parsed;
      const idx = this.users.findIndex(u => u.idUser === this.editingUser!.idUser);
      if (idx !== -1) {
        this.users[idx] = {
          ...this.users[idx],
          firstName: updated.firstName || firstName,
          surName: updated.surName || surName,
          email: updated.email || email
        };
      }
      this.applyFilters();
      this.closeEditModal();
      this.toast.toastSuccess('Éxito', 'Usuario actualizado correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo actualizar el usuario');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  // Delete
  openDeleteModal(user: UserResponse) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }
  confirmDelete() {
    if (!this.userToDelete?.idUser) return;
    this.actionLoading = true;
    this.api.invoke(deleteUser, { idUser: this.userToDelete.idUser }).then(() => {
      this.users = this.users.filter(u => u.idUser !== this.userToDelete!.idUser);
      this.applyFilters();
      this.closeDeleteModal();
      this.toast.toastSuccess('Éxito', 'Usuario eliminado correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo eliminar el usuario');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  // Change role
  openRoleModal(user: UserResponse) {
    this.userToChangeRole = user;
    this.newRole = (user.role as any) || 'ROLE_STUDENT';
    this.showRoleModal = true;
  }
  closeRoleModal() {
    this.showRoleModal = false;
    this.userToChangeRole = null;
  }
  confirmChangeRole() {
    if (!this.userToChangeRole?.idUser) return;
    this.actionLoading = true;
    this.api.invoke(changeRole, { idUser: this.userToChangeRole.idUser, body: { role: this.newRole } }).then(() => {
      const idx = this.users.findIndex(u => u.idUser === this.userToChangeRole!.idUser);
      if (idx !== -1) this.users[idx].role = this.newRole;
      this.applyFilters();
      this.closeRoleModal();
      this.toast.toastSuccess('Éxito', 'Rol actualizado correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cambiar el rol');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  getRoleLabel(role: string | undefined): string {
    const labels: Record<string, string> = {
      ROLE_ADMIN: 'Administrador',
      ROLE_TEACHER: 'Docente',
      ROLE_STUDENT: 'Estudiante'
    };
    return labels[role || ''] || role || '';
  }

  getInitials(user: UserResponse): string {
    return ((user.firstName?.charAt(0) || '') + (user.surName?.charAt(0) || '')).toUpperCase();
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.editForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
