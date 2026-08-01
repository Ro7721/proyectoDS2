import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MyCourseResponse } from '../../../../models/enrollment.model';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { getCertificate, getMyCourses } from '../../../../api/functions';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CertificateModal } from '../../learning/certificate-modal/certificate-modal';
import { AuthService } from '../../../../core/auth/auth.service';
import { CertificateResponse } from '../../../../models/learning.model';
import { getApiMessage, isApiEnvelope, parseApiPayload, unwrapApiResponse } from '../../../../core/utils/api-response';

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule, FormsModule, CertificateModal],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.css',
})
export class MyCourses implements OnInit {

  private changeDetector = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  courses: MyCourseResponse[] = [];
  filtered: MyCourseResponse[] = [];
  loading = true;

  // Filters
  searchQuery = '';
  activeFilter: 'ALL' | 'IN_PROGRESS' | 'COMPLETED' = 'ALL';
  sortBy: 'recent' | 'progress' | 'alpha' = 'recent';

  statusFilters = [
    { label: 'Todos', value: 'ALL' as const },
    { label: 'En progreso', value: 'IN_PROGRESS' as const },
    { label: 'Completados', value: 'COMPLETED' as const },
  ];

  // Certificate
  showCertificateModal = false;
  selectedCourseName = '';
  selectedTeacherName = '';
  selectedTotalLessons = 0;
  certificateData?: CertificateResponse;

  get studentName(): string {
    const user = this.authService.user;
    if (!user) return 'Estudiante';
    return `${user.firstName ?? ''} ${user.surName ?? ''}`.trim() || user.email || 'Estudiante';
  }

  get completedCount(): number {
    return this.courses.filter(c => c.completed).length;
  }

  get inProgressCount(): number {
    return this.courses.filter(c => !c.completed).length;
  }

  constructor(private api: Api, private toast: MessageToast, private router: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    this.api.invoke(getMyCourses).then((response: unknown) => {
      const apiResponse = parseApiPayload<MyCourseResponse[]>(response);

      if (Array.isArray(apiResponse)) {
        this.courses = apiResponse;
      } else if (isApiEnvelope<MyCourseResponse[]>(apiResponse)) {
        this.courses = apiResponse.data ?? [];
      } else {
        this.toast.toastError(getApiMessage(apiResponse, 'Error al cargar los cursos'));
      }

      this.applyFilters();
      this.loading = false;
      this.changeDetector.detectChanges();
    }).catch((error: any) => {
      this.toast.toastError('Error al cargar los cursos: ' + error.message);
      this.loading = false;
    });
  }

  applyFilters(): void {
    let result = [...this.courses];

    // Filter by status
    if (this.activeFilter === 'COMPLETED') {
      result = result.filter(c => c.completed);
    } else if (this.activeFilter === 'IN_PROGRESS') {
      result = result.filter(c => !c.completed);
    }

    // Filter by search
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.teacherFullName.toLowerCase().includes(q) ||
        (c.categoryName ?? '').toLowerCase().includes(q)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'progress':
        result.sort((a, b) => b.totalProgress - a.totalProgress);
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime());
    }

    this.filtered = result;
    this.changeDetector.detectChanges();
  }

  setFilter(value: 'ALL' | 'IN_PROGRESS' | 'COMPLETED'): void {
    this.activeFilter = value;
    this.applyFilters();
  }

  getCount(filter: 'ALL' | 'IN_PROGRESS' | 'COMPLETED'): number {
    if (filter === 'ALL') return this.courses.length;
    if (filter === 'COMPLETED') return this.completedCount;
    return this.inProgressCount;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.activeFilter = 'ALL';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  exploreCourses() {
    this.router.navigate(['/catalog']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  continueCourse(course: MyCourseResponse) {
    this.router.navigate(['/dashboard/learning/course', course.idCourse]);
  }

  async openCertificate(course: MyCourseResponse): Promise<void> {
    try {

      const res: unknown = await this.api.invoke(getCertificate, { idCourse: course.idCourse });
      const apiResponse = parseApiPayload<CertificateResponse>(res);

      if (isApiEnvelope(apiResponse) && apiResponse.response?.type !== 'success') {
        throw new Error(getApiMessage(apiResponse, 'Error al obtener certificado'));
      }

      this.certificateData = unwrapApiResponse<CertificateResponse>(apiResponse);
      this.selectedCourseName = course.title;
      this.selectedTeacherName = course.teacherFullName;
      this.selectedTotalLessons = course.totalLessons;
      this.showCertificateModal = true;
      this.changeDetector.detectChanges();
    } catch (err: any) {
      this.toast.toastError('No se pudo cargar el certificado', err.message || 'Intenta nuevamente.');
    }
  }
}
