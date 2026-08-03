import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherEnrollmentsService } from '../student/teacher-enrollments/teacher-enrollments.service';
import { TeacherEnrollmentResponse } from '../../../models/teacher.model';
import { CertificateModal } from '../../student/learning/certificate-modal/certificate-modal';
import { getCertificate } from '../../../api/functions';
import { Api } from '../../../api/api';
import { CertificateResponse } from '../../../models/learning.model';
import { MessageToast } from '../../../message/message-toast';
import { parseApiPayload, isApiEnvelope, unwrapApiResponse, getApiMessage } from '../../../core/utils/api-response';

@Component({
  selector: 'app-teacher-certificates',
  standalone: true,
  imports: [CommonModule, CertificateModal],
  templateUrl: './teacher-certificates.html',
  styleUrl: './teacher-certificates.css',
})
export class TeacherCertificates implements OnInit {
  private readonly enrollmentsService = inject(TeacherEnrollmentsService);
  private readonly api = inject(Api);
  private readonly toast = inject(MessageToast);
  private readonly cdr = inject(ChangeDetectorRef);

  completedEnrollments: TeacherEnrollmentResponse[] = [];
  loading = true;

  // Certificate Modal State
  showCertificate = false;
  selectedStudentName = '';
  selectedCourseName = '';
  selectedTeacherName = '';
  selectedTotalLessons = 0;
  certificateData?: CertificateResponse;

  ngOnInit(): void {
    this.loadCompletedEnrollments();
  }

  async loadCompletedEnrollments(): Promise<void> {
    this.loading = true;
    try {
      const data = await this.enrollmentsService.getEnrollments();
      // Filter enrollments that are completed
      this.completedEnrollments = data.filter(e => e.completed);
    } catch (err: any) {
      this.toast.toastError('Error al cargar certificaciones: ' + err.message);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async openCertificate(enrollment: TeacherEnrollmentResponse): Promise<void> {
    try {
      const res: unknown = await this.api.invoke(getCertificate, { idCourse: enrollment.idCourse });
      const apiResponse = parseApiPayload<CertificateResponse>(res);

      if (isApiEnvelope(apiResponse) && apiResponse.response?.type !== 'success') {
        throw new Error(getApiMessage(apiResponse, 'Error al obtener certificado'));
      }

      this.certificateData = unwrapApiResponse<CertificateResponse>(apiResponse);
      
      // Override studentName and courseName with the enrollment ones to display correctly
      this.selectedStudentName = enrollment.studentFullName;
      this.selectedCourseName = enrollment.courseTitle;
      this.selectedTeacherName = this.certificateData?.teacherName || '';
      this.selectedTotalLessons = this.certificateData?.totalLessons || 0;
      
      this.showCertificate = true;
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
