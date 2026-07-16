import { Component, Input } from '@angular/core';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';
import { CommonModule, DatePipe } from '@angular/common';
import { CertificateModal } from '../../../student/learning/certificate-modal/certificate-modal';

@Component({
  selector: 'app-teacher-enrollment-detail',
  imports: [CommonModule, DatePipe, CertificateModal],
  templateUrl: './teacher-enrollment-detail.html',
  styleUrl: './teacher-enrollment-detail.css',
})
export class TeacherEnrollmentDetail {
  @Input() enrollment?: TeacherEnrollmentResponse;
  showCertificate = false;

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('');
  }
}
