import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../../api/api';
import { FindByTeacher$Params, findByTeacher, getAll1 } from '../../../../api/functions';
import { CourseResponse } from '../../../../models/course.model';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { CourseDetails } from '../course-details/course-details';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageToast } from '../../../../message/message-toast';
import { CategoryResponse } from '../../../../models/category.model';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { deleteCourse } from '../../../../api/functions';

@Component({
  selector: 'app-course-getall',
  imports: [CommonModule, RouterLink, FormsModule, ButtonModule, TagModule, SkeletonModule, Toast, CourseDetails, SelectModule],
  templateUrl: './course-getall.html',
  styleUrl: './course-getall.css',
})
export class CourseGetall implements OnInit {
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  // Data
  listCourses: CourseResponse[] = [];
  filteredCourses: CourseResponse[] = [];
  categories: CategoryResponse[] = [];

  // UI state
  selectedCourseId: string | null = null;
  loading = true;
  showDetails = false;
  viewMode: 'grid' | 'list' = 'grid';

  // Filter state
  searchQuery = '';
  selectedCategoryId: string | null = null;

  teacherId = this.authService.user?.idUser || '';

  get categoriesWithAll(): any[] {
    return [{ idCategory: '', name: 'Todas las categorías' }, ...this.categories];
  }

  constructor(private toastMessage: MessageToast,
    private Confirmation: ConfirmationService) { }

  ngOnInit(): void {
    this.loadCourses();
    this.loadCategories();
  }

  loadCourses(): void {
    this.loading = true;
    this.searchQuery = '';
    this.selectedCategoryId = null;

    this.api
      .invoke<FindByTeacher$Params, any>(findByTeacher, { teacherId: this.teacherId })
      .then((response) => {
        this.listCourses = response?.data ?? [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.toastMessage.toastError('Error al cargar cursos', error?.message || 'Ocurrió un error');
        this.listCourses = [];
        this.filteredCourses = [];
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  onSearchInput(): void {
    this.applyFilters();
  }

  onCategoryChange(categoryId: string | null): void {
    this.selectedCategoryId = categoryId;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.listCourses];

    // Text search
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.categoryName ?? '').toLowerCase().includes(q)
      );
    }

    // Category filter (filter by name since CourseResponse doesn't expose idCategory)
    if (this.selectedCategoryId) {
      const cat = this.categories.find(c => c.idCategory === this.selectedCategoryId);
      if (cat) {
        result = result.filter(c => c.categoryName === cat.name);
      }
    }

    this.filteredCourses = result;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.applyFilters();
  }

  openCourseDetail(course: CourseResponse): void {
    this.selectedCourseId = course.idCourse;
    this.showDetails = true;
  }

  onDetailsVisibilityChange(visible: boolean): void {
    this.showDetails = visible;
    if (!visible) {
      this.selectedCourseId = null;
    }
  }

  getLevelSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn'> = {
      BASICO: 'success',
      BASIC: 'success',
      INTERMEDIO: 'info',
      INTERMEDIATE: 'info',
      AVANZADO: 'warn',
      ADVANCED: 'warn',
    };
    return map[level?.toUpperCase()] ?? 'info';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'secondary'> = {
      PUBLICADO: 'success',
      BORRADOR: 'secondary',
      DRAFT: 'secondary',
      PUBLISHED: 'success',
      PAUSADO: 'warn',
    };
    return map[status?.toUpperCase()] ?? 'secondary';
  }

  formatPrice(price: number): string {
    if (!price) return 'Gratis';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
  }

  loadCategories() {
    this.api.invoke(getAll1).then((response: any) => {
      const apiResponse = typeof response == 'string' ? JSON.parse(response) : response;
      if (Array.isArray(apiResponse)) {
        this.categories = apiResponse;
      } else if (apiResponse && Array.isArray(apiResponse.data)) {
        this.categories = apiResponse.data;
      }
      this.cdr.detectChanges();
    }).catch((error) => {
      this.toastMessage.toastError('Error al cargar categorías', error?.message || 'Ocurrió un error');
      this.categories = [];
      this.cdr.detectChanges();
    });
  }
}
