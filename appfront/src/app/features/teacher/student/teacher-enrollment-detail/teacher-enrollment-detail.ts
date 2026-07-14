import { Component, Input } from '@angular/core';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-teacher-enrollment-detail',
  imports: [CommonModule, DatePipe],
  templateUrl: './teacher-enrollment-detail.html',
  styleUrl: './teacher-enrollment-detail.css',
})
export class TeacherEnrollmentDetail {
  @Input() enrollment?: TeacherEnrollmentResponse;
}
