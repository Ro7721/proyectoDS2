import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../../../api/api';
import { Apicoursesbyteacher$Params, apicoursesbyteacher } from '../../../../api/functions';
import { CourseResponse } from '../../../../models/course.model';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { CourseDetails } from '../course-details/course-details';

@Component({
  selector: 'app-course-getall',
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, SkeletonModule, Toast, CourseDetails],
  templateUrl: './course-getall.html',
  styleUrl: './course-getall.css',
})
export class CourseGetall implements OnInit {
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);

  listCourses: CourseResponse[] = [];
  selectedCourseId: string | null = null;
  loading = true;
  showDetails = false;
  notFound = false;

  // TODO: reemplazar con AuthService cuando el login exponga el docente autenticado.
  private teacherId = 'cbc516d9-3b5e-47a6-8c53-ccd271ec277e';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.notFound = false;

    this.api
      .invoke<Apicoursesbyteacher$Params, any>(apicoursesbyteacher, {
        teacherId: this.teacherId,
      })
      .then((response) => {
        this.listCourses = response?.data ?? [];
        this.notFound = this.listCourses.length === 0;
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error al cargar cursos:', error);
        this.listCourses = [];
        this.loading = false;
        this.notFound = true;
        this.cdr.detectChanges();
      });
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
      INTERMEDIO: 'info',
      AVANZADO: 'warn',
    };
    return map[level?.toUpperCase()] ?? 'info';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'secondary'> = {
      PUBLICADO: 'success',
      BORRADOR: 'secondary',
      PAUSADO: 'warn',
    };
    return map[status?.toUpperCase()] ?? 'secondary';
  }

  formatPrice(price: number): string {
    if (!price) return 'Gratis';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
  }
}
