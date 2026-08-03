import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUsersComponent } from './admin-users';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { ChangeDetectorRef } from '@angular/core';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;
  let mockApi: any;
  let mockToast: any;
  let mockCdr: any;

  const fakeUsers = [
    {
      idUser: 'user-001',
      firstName: 'Ana',
      surName: 'Torres',
      email: 'ana@test.com',
      role: 'ROLE_STUDENT',
      active: true,
    },
    {
      idUser: 'user-002',
      firstName: 'Carlos',
      surName: 'Gomez',
      email: 'carlos@test.com',
      role: 'ROLE_TEACHER',
      active: false,
    },
    {
      idUser: 'user-003',
      firstName: 'Admin',
      surName: 'User',
      email: 'admin@test.com',
      role: 'ROLE_ADMIN',
      active: true,
    },
  ];

  beforeEach(async () => {
    mockApi = {
      invoke: vi.fn().mockResolvedValue(fakeUsers),
    };

    mockToast = {
      toastSuccess: vi.fn(),
      toastError: vi.fn(),
      toastWarn: vi.fn(),
    };

    mockCdr = {
      detectChanges: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminUsersComponent, CommonModule, ReactiveFormsModule],
      providers: [
        { provide: Api, useValue: mockApi },
        { provide: MessageToast, useValue: mockToast },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    component.initForm(); // init form so editForm is not undefined
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllMocks();
  });

  // =========== Creación ===========

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con estado de carga', () => {
    expect(component.loading).toBe(true);
    expect(component.users).toEqual([]);
    expect(component.filteredUsers).toEqual([]);
    expect(component.paginatedUsers).toEqual([]);
  });

  it('debería inicializar los valores de paginación correctamente', () => {
    expect(component.currentPage).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.totalPages).toBe(1);
  });

  // =========== loadUsers ===========

  it('debería cargar usuarios y aplicar filtros tras loadUsers', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    expect(component.users).toHaveLength(3);
    expect(component.filteredUsers).toHaveLength(3);
    expect(component.loading).toBe(false);
  });

  it('debería manejar array en data wrapper', async () => {
    mockApi.invoke.mockResolvedValue({ data: fakeUsers });
    component.loadUsers();
    await fixture.whenStable();

    expect(component.users).toHaveLength(3);
  });

  it('debería mostrar toast de error si loadUsers falla', async () => {
    mockApi.invoke.mockRejectedValue(new Error('Server error'));
    component.loadUsers();
    await fixture.whenStable();

    expect(mockToast.toastError).toHaveBeenCalled();
  });

  // =========== applyFilters ===========

  it('debería filtrar usuarios por nombre', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.searchQuery = 'ana';
    component.applyFilters();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].firstName).toBe('Ana');
  });

  it('debería filtrar por correo electrónico', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.searchQuery = 'carlos@test.com';
    component.applyFilters();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].email).toBe('carlos@test.com');
  });

  it('debería filtrar por rol', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.filterRole = 'ROLE_STUDENT';
    component.applyFilters();

    expect(component.filteredUsers).toHaveLength(1);
    expect(component.filteredUsers[0].role).toBe('ROLE_STUDENT');
  });

  it('debería filtrar por estado activo', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.filterStatus = 'true';
    component.applyFilters();

    expect(component.filteredUsers.every(u => u.active === true)).toBe(true);
  });

  it('debería filtrar por estado inactivo', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.filterStatus = 'false';
    component.applyFilters();

    expect(component.filteredUsers.every(u => u.active === false)).toBe(true);
    expect(component.filteredUsers).toHaveLength(1);
  });

  it('clearFilters debería limpiar todos los filtros', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.searchQuery = 'ana';
    component.filterRole = 'ROLE_STUDENT';
    component.filterStatus = 'true';
    component.clearFilters();

    expect(component.searchQuery).toBe('');
    expect(component.filterRole).toBe('');
    expect(component.filterStatus).toBe('');
    expect(component.filteredUsers).toHaveLength(3);
  });

  // =========== Paginación ===========

  it('updatePagination debería calcular totalPages correctamente', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.pageSize = 2;
    component.updatePagination();

    expect(component.totalPages).toBe(2);
  });

  it('goToPage debería cambiar la página actual', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.pageSize = 1;
    component.updatePagination();
    component.goToPage(2);

    expect(component.currentPage).toBe(2);
    expect(component.paginatedUsers).toHaveLength(1);
  });

  it('goToPage no debería ir a página < 1', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.goToPage(0);
    expect(component.currentPage).toBe(1);
  });

  it('goToPage no debería ir a página > totalPages', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.goToPage(999);
    expect(component.currentPage).toBe(1);
  });

  it('pageNumbers debería retornar números de página correctos', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.pageSize = 1;
    component.currentPage = 2;
    component.updatePagination();

    const pages = component.pageNumbers;
    expect(pages).toContain(2);
    expect(pages.length).toBeGreaterThan(0);
  });

  // =========== Modales ===========

  it('openEditModal debería configurar el modal de edición', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.openEditModal(fakeUsers[0] as any);

    expect(component.showEditModal).toBe(true);
    expect(component.editingUser).toEqual(fakeUsers[0] as any);
    expect(component.editForm.get('firstName')?.value).toBe('Ana');
    expect(component.editForm.get('email')?.value).toBe('ana@test.com');
  });

  it('closeEditModal debería cerrar el modal y limpiar el formulario', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    component.openEditModal(fakeUsers[0] as any);
    component.closeEditModal();

    expect(component.showEditModal).toBe(false);
    expect(component.editingUser).toBeNull();
  });

  it('openDeleteModal debería configurar el modal de eliminación', () => {
    component.openDeleteModal(fakeUsers[0] as any);

    expect(component.showDeleteModal).toBe(true);
    expect(component.userToDelete).toEqual(fakeUsers[0] as any);
  });

  it('closeDeleteModal debería cerrar el modal de eliminación', () => {
    component.openDeleteModal(fakeUsers[0] as any);
    component.closeDeleteModal();

    expect(component.showDeleteModal).toBe(false);
    expect(component.userToDelete).toBeNull();
  });

  it('openRoleModal debería configurar el modal de cambio de rol', () => {
    component.openRoleModal(fakeUsers[0] as any);

    expect(component.showRoleModal).toBe(true);
    expect(component.userToChangeRole).toEqual(fakeUsers[0] as any);
    expect(component.newRole).toBe('ROLE_STUDENT');
  });

  it('closeRoleModal debería cerrar el modal de rol', () => {
    component.openRoleModal(fakeUsers[0] as any);
    component.closeRoleModal();

    expect(component.showRoleModal).toBe(false);
    expect(component.userToChangeRole).toBeNull();
  });

  // =========== Helpers ===========

  it('getRoleLabel debería mapear roles correctamente', () => {
    expect(component.getRoleLabel('ROLE_ADMIN')).toBe('Administrador');
    expect(component.getRoleLabel('ROLE_TEACHER')).toBe('Docente');
    expect(component.getRoleLabel('ROLE_STUDENT')).toBe('Estudiante');
    expect(component.getRoleLabel('UNKNOWN')).toBe('UNKNOWN');
    expect(component.getRoleLabel(undefined as any)).toBe('');
  });

  it('getInitials debería retornar las iniciales correctamente', () => {
    const user = { firstName: 'Ana', surName: 'Torres' } as any;
    expect(component.getInitials(user)).toBe('AT');
  });

  it('getInitials debería manejar nombres vacíos', () => {
    const user = { firstName: '', surName: '' } as any;
    expect(component.getInitials(user)).toBe('');
  });

  it('isFieldInvalid debería retornar false cuando el campo es válido', () => {
    component.initForm();
    component.editForm.get('firstName')?.setValue('Juan');
    component.editForm.get('firstName')?.markAsTouched();

    expect(component.isFieldInvalid('firstName')).toBe(false);
  });

  it('isFieldInvalid debería retornar true cuando el campo es inválido y tocado', () => {
    component.initForm();
    component.editForm.get('firstName')?.setValue('');
    component.editForm.get('firstName')?.markAsTouched();

    expect(component.isFieldInvalid('firstName')).toBe(true);
  });

  // =========== saveEdit validación ===========

  it('saveEdit debería mostrar warning si el formulario es inválido', () => {
    component.initForm();
    component.editForm.get('firstName')?.setValue('');
    component.editingUser = fakeUsers[0] as any;

    component.saveEdit();

    expect(mockToast.toastWarn).toHaveBeenCalled();
  });

  it('saveEdit debería llamar a la API si el formulario es válido', async () => {
    component.initForm();
    component.editForm.patchValue({
      firstName: 'Ana',
      surName: 'Torres',
      email: 'ana@test.com',
      password: '',
    });
    component.editingUser = fakeUsers[0] as any;

    mockApi.invoke.mockResolvedValue({ data: fakeUsers[0] });
    component.saveEdit();
    await fixture.whenStable();

    expect(mockApi.invoke).toHaveBeenCalled();
  });

  // =========== onSearch ===========

  it('onSearch debería actualizar searchQuery', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    const event = { target: { value: 'ana' } } as unknown as Event;
    component.onSearch(event);

    expect(component.searchQuery).toBe('ana');
    expect(component.filteredUsers).toHaveLength(1);
  });

  // =========== onFilterRole y onFilterStatus ===========

  it('onFilterRole debería actualizar filterRole y aplicar filtros', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    const event = { target: { value: 'ROLE_ADMIN' } } as unknown as Event;
    component.onFilterRole(event);

    expect(component.filterRole).toBe('ROLE_ADMIN');
    expect(component.filteredUsers).toHaveLength(1);
  });

  it('onFilterStatus debería actualizar filterStatus y aplicar filtros', async () => {
    mockApi.invoke.mockResolvedValue(fakeUsers);
    component.loadUsers();
    await fixture.whenStable();

    const event = { target: { value: 'true' } } as unknown as Event;
    component.onFilterStatus(event);

    expect(component.filterStatus).toBe('true');
  });
});
