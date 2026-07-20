import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentCard } from '../enrollment-card/enrollment-card';
import { EnrollmentFilter } from '../enrollment-filter/enrollment-filter';
import { TeacherEnrollmentDetail } from '../teacher-enrollment-detail/teacher-enrollment-detail';
import { TeacherEnrollmentsService, CourseSummary } from './teacher-enrollments.service';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';

@Component({
  selector: 'app-teacher-enrollments',
  imports: [CommonModule, EnrollmentCard, EnrollmentFilter, TeacherEnrollmentDetail],
  templateUrl: './teacher-enrollments.html',
  styleUrl: './teacher-enrollments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherEnrollments implements OnInit {
  private enrollmentsService = inject(TeacherEnrollmentsService);
  private cdr = inject(ChangeDetectorRef);

  // ── State ──
  loading = true;
  enrollments: TeacherEnrollmentResponse[] = [];
  filtered: TeacherEnrollmentResponse[] = [];
  selectedEnrollment?: TeacherEnrollmentResponse;

  // ── Filter state ──
  search = '';
  status = 'ALL';

  // ── Aggregates ──
  totalEnrollments = 0;
  courseSummary: CourseSummary[] = [];

  ngOnInit(): void {
    this.load();
  }

  /** Fetch data from the service and compute aggregates */
  private async load(): Promise<void> {
    this.loading = true;

    const data = await this.enrollmentsService.getEnrollments();

    this.enrollments = data;
    this.totalEnrollments = data.length;
    this.courseSummary = this.enrollmentsService.computeCourseSummary(data);

    this.applyFilter();

    if (this.filtered.length) {
      this.selectedEnrollment = this.filtered[0];
    }

    this.loading = false;
    this.cdr.markForCheck();
  }

  // ── UI event handlers ──

  onSearch(value: string): void {
    this.search = value;
    this.applyFilter();
  }

  onStatus(value: string): void {
    this.status = value;
    this.applyFilter();
  }

  selectEnrollment(enrollment: TeacherEnrollmentResponse): void {
    this.selectedEnrollment = enrollment;
  }

  // ── Filtering (delegated to service) ──

  private applyFilter(): void {
    this.filtered = this.enrollmentsService.filterEnrollments(
      this.enrollments,
      this.search,
      this.status,
    );

    // Keep the selected item visible after a filter change
    if (
      this.selectedEnrollment &&
      !this.filtered.some(x => x.idEnrollment === this.selectedEnrollment!.idEnrollment)
    ) {
      this.selectedEnrollment = this.filtered[0];
    }

    this.cdr.markForCheck();
  }
}
