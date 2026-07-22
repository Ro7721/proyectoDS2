import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Api } from '../../../../api/api';
import { getAll1 as getAllCategories, insert as insertCategory } from '../../../../api/functions';
import { updateCategory } from '../../../../api/fn/category-controller/update-category';
import { deleteCategory } from '../../../../api/fn/category-controller/delete-category';
import { CategoryResponse } from '../../../../api/models/category-response';
import { MessageToast } from '../../../../message/message-toast';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css'
})
export class AdminCategoriesComponent implements OnInit {
  categories: CategoryResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
  loading = true;
  searchQuery = '';
  actionLoading = false;

  showFormModal = false;
  showDeleteModal = false;

  isEditing = false;
  editingCategory: CategoryResponse | null = null;
  categoryForm!: FormGroup;

  categoryToDelete: CategoryResponse | null = null;

  constructor(
    readonly api: Api,
    private fb: FormBuilder,
    private toast: MessageToast,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    Promise.resolve().then(() => this.loadCategories());
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      description: ['', [Validators.maxLength(200)]]
    });
  }

  get f() { return this.categoryForm.controls; }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.categoryForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  loadCategories() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.invoke(getAllCategories).then((response: any) => {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (Array.isArray(parsed)) {
        this.categories = parsed;
      } else if (parsed.data) {
        this.categories = parsed.data;
      } else {
        this.categories = [];
      }
      this.applySearch();
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cargar las categorías');
      console.error(err);
    }).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase();
    if (!q) {
      this.filteredCategories = [...this.categories];
      return;
    }
    this.filteredCategories = this.categories.filter(c =>
      (c.name?.toLowerCase() || '').includes(q) ||
      (c.description?.toLowerCase() || '').includes(q)
    );
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applySearch();
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showFormModal = true;
  }

  openEditModal(category: CategoryResponse) {
    this.isEditing = true;
    this.editingCategory = category;
    this.categoryForm.reset();
    this.categoryForm.patchValue({
      name: category.name || '',
      description: category.description || ''
    });
    this.showFormModal = true;
  }

  closeFormModal() {
    this.showFormModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory() {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) {
      this.toast.toastWarn('Formulario inválido', 'Por favor corrija los errores antes de guardar');
      return;
    }
    this.actionLoading = true;
    const { name, description } = this.categoryForm.value;

    if (this.isEditing && this.editingCategory?.idCategory) {
      this.api.invoke(updateCategory, {
        idCategory: this.editingCategory.idCategory,
        body: { name, description }
      }).then((resp: any) => {
        const parsed = typeof resp === 'string' ? JSON.parse(resp) : resp;
        const updated = parsed.data || parsed;
        const idx = this.categories.findIndex(c => c.idCategory === this.editingCategory!.idCategory);
        if (idx !== -1) this.categories[idx] = { ...this.categories[idx], ...updated };
        this.applySearch();
        this.closeFormModal();
        this.toast.toastSuccess('Éxito', 'Categoría actualizada correctamente');
      }).catch(err => {
        this.toast.toastError('Error', 'No se pudo actualizar la categoría');
        console.error(err);
      }).finally(() => { this.actionLoading = false; });
    } else {
      this.api.invoke(insertCategory, {
        body: { name, description }
      }).then((resp: any) => {
        const parsed = typeof resp === 'string' ? JSON.parse(resp) : resp;
        const created = parsed.data || parsed;
        if (created) this.categories.unshift(created);
        this.applySearch();
        this.closeFormModal();
        this.toast.toastSuccess('Éxito', 'Categoría creada correctamente');
      }).catch(err => {
        this.toast.toastError('Error', 'No se pudo crear la categoría');
        console.error(err);
      }).finally(() => { this.actionLoading = false; });
    }
  }

  openDeleteModal(category: CategoryResponse) {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.categoryToDelete = null;
  }
  confirmDelete() {
    if (!this.categoryToDelete?.idCategory) return;
    this.actionLoading = true;
    this.api.invoke(deleteCategory, { idCategory: this.categoryToDelete.idCategory }).then(() => {
      this.categories = this.categories.filter(c => c.idCategory !== this.categoryToDelete!.idCategory);
      this.applySearch();
      this.closeDeleteModal();
      this.toast.toastSuccess('Éxito', 'Categoría eliminada correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo eliminar la categoría');
      console.error(err);
    }).finally(() => { this.actionLoading = false; });
  }

  getCategoryIcon(name: string | undefined): string {
    const icons: Record<string, string> = {
      'programación': 'pi-code', 'diseño': 'pi-palette', 'marketing': 'pi-megaphone',
      'negocios': 'pi-briefcase', 'música': 'pi-volume-up', 'idiomas': 'pi-globe',
      'fotografía': 'pi-camera', 'ciencia': 'pi-calculator'
    };
    const lower = (name || '').toLowerCase();
    for (const key in icons) {
      if (lower.includes(key)) return icons[key];
    }
    return 'pi-hashtag';
  }
}
