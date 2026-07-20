import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../../api/api';
import { CourseResponse } from '../../../models/course.model';
import { apidetailsCourse, enrollmentInsert, EnrollmentInsert$Params } from '../../../api/functions';
import { checkEnrollment } from '../../../api/fn/enrollment/check-enrollment';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail implements OnInit {
  private changeDetectorRef = inject(ChangeDetectorRef);
  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router,
    public authService: AuthService
  ) { }
  loading = true;
  enrolling = false;
  enrolled = false;
  enrollError = '';
  course?: CourseResponse;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(id);
    }
  }

  lessonOption(level: string): string {
    switch (level) {
      case 'BASIC':
        return 'Básico';
      case 'INTERMEDIATE':
        return 'Intermedio';
      case 'ADVANCED':
        return 'Avanzado';
      default:
        return level;
    }
  }

  async enrollCourse() {
    // Si no está autenticado, redirigir al login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(
        ['/auth/login'],
        {
          queryParams: {
            returnUrl: this.router.url
          }
        }
      );
      return;
    }

    // Si ya está inscrito o en proceso, no hacer nada
    if (this.enrolled || this.enrolling) return;
    if (!this.course) return;

    this.enrolling = true;
    this.enrollError = '';
    this.changeDetectorRef.detectChanges();

    try {
      await this.api.invoke<EnrollmentInsert$Params, void>(enrollmentInsert, {
        body: {
          courseId: this.course.idCourse
        }
      });
      this.enrolled = true;
      this.enrolling = false;
      this.changeDetectorRef.detectChanges();

      // Redirigir a "Mis Cursos" después de mostrar el mensaje de éxito
      setTimeout(() => {
        this.router.navigate(['/dashboard/learning']);
      }, 1500);
    } catch (error: any) {
      console.error('Error al inscribirse:', error);
      const err = error?.error;
      const messages = err?.response?.listMessage;
      this.enrollError = messages?.length ? messages[0] : (err?.message || 'Error al inscribirse. Intenta de nuevo.');
      this.enrolling = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  alreadyEnrolled = false;

  loadCourse(id: string) {
    this.loading = true;
    this.api.invoke(apidetailsCourse, { idCourse: id }).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;
      this.course = apiResponseData.data || apiResponseData;

      if (this.authService.isAuthenticated()) {
        this.checkIfEnrolled(id);
      } else {
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      }
    }).catch(() => {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
    });
  }

  checkIfEnrolled(courseId: string) {
    this.api.invoke(checkEnrollment, { courseId }).then((isEnrolled: any) => {
      this.alreadyEnrolled = isEnrolled;
    }).finally(() => {
      this.loading = false;
      this.changeDetectorRef.detectChanges();
    });
  }
  calculatePrice(price: number): number {
    if (price <= 0) {
      return 0;
    }
    return +(price * 0.95).toFixed(2);
  }

  formatPrice(price: number | undefined): string {
    if (!price || price <= 0) {
      return 'Gratis';
    }
    const finalPrice = this.calculatePrice(price);

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(finalPrice);
  }
  regresar() {
    this.router.navigate(['/catalog']);
  }
}
