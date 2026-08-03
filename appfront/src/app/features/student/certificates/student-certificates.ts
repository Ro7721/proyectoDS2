import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../api/api';
import { getMyCourses, getCertificate } from '../../../api/functions';
import { MyCourseResponse } from '../../../models/enrollment.model';
import { CertificateResponse } from '../../../models/learning.model';
import { CertificateModal } from '../learning/certificate-modal/certificate-modal';
import { MessageToast } from '../../../message/message-toast';
import { parseApiPayload, isApiEnvelope, unwrapApiResponse, getApiMessage } from '../../../core/utils/api-response';

import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, CertificateModal],
  templateUrl: './student-certificates.html',
  styleUrl: './student-certificates.css',
})
export class StudentCertificates implements OnInit {
  private readonly api = inject(Api);
  private readonly toast = inject(MessageToast);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);

  completedCourses: MyCourseResponse[] = [];
  loading = true;

  get studentName(): string {
    const user = this.authService.user;
    if (!user) return 'Estudiante';
    return `${user.firstName ?? ''} ${user.surName ?? ''}`.trim() || user.email || 'Estudiante';
  }

  // Certificate Modal State
  showCertificateModal = false;
  selectedCourseName = '';
  selectedTeacherName = '';
  selectedTotalLessons = 0;
  certificateData?: CertificateResponse;

  ngOnInit(): void {
    this.loadCompletedCourses();
  }

  loadCompletedCourses(): void {
    this.loading = true;
    this.api.invoke(getMyCourses).then((response: unknown) => {
      const apiResponse = parseApiPayload<MyCourseResponse[]>(response);
      let allCourses: MyCourseResponse[] = [];

      if (Array.isArray(apiResponse)) {
        allCourses = apiResponse;
      } else if (isApiEnvelope<MyCourseResponse[]>(apiResponse)) {
        allCourses = apiResponse.data ?? [];
      } else {
        this.toast.toastError(getApiMessage(apiResponse, 'Error al cargar los cursos'));
      }

      // Filter only completed courses
      this.completedCourses = allCourses.filter(c => c.completed);
      this.loading = false;
      this.cdr.detectChanges();
    }).catch((error: any) => {
      this.toast.toastError('Error al cargar certificados: ' + error.message);
      this.loading = false;
      this.cdr.detectChanges();
    });
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
      this.cdr.detectChanges();
    } catch (err: any) {
      this.toast.toastError('No se pudo cargar el certificado', err.message || 'Intenta nuevamente.');
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
