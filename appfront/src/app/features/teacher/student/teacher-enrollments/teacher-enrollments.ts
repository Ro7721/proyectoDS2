import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Api } from '../../../../api/api';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';
import { apiTeacherenrollments } from '../../../../api/functions';
import { CommonModule } from '@angular/common';
import { EnrollmentCard } from '../enrollment-card/enrollment-card';
import { EnrollmentFilter } from '../enrollment-filter/enrollment-filter';
import { TeacherEnrollmentDetail } from '../teacher-enrollment-detail/teacher-enrollment-detail';

@Component({
  selector: 'app-teacher-enrollments',
  imports: [CommonModule, EnrollmentCard, EnrollmentFilter, TeacherEnrollmentDetail],
  templateUrl: './teacher-enrollments.html',
  styleUrl: './teacher-enrollments.css',
})
export class TeacherEnrollments implements OnInit {
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);

  loading = true;

  enrollments: TeacherEnrollmentResponse[] = [];
  filtered: TeacherEnrollmentResponse[] = [];

  selectedEnrollment?: TeacherEnrollmentResponse;

  search = '';
  status = 'ALL';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.api.invoke(apiTeacherenrollments)
      .then(res => {
        const data = this.unwrap<TeacherEnrollmentResponse[]>(res);
        this.enrollments = data ?? [];
        this.applyFilter();

        if (this.filtered.length) {
          this.selectedEnrollment = this.filtered[0];
        }
      })
      .finally(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

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

  private applyFilter(): void {

    const search = this.search.toLowerCase();

    this.filtered = this.enrollments.filter(e => {

      const matchesSearch =
        e.studentFullName.toLowerCase().includes(search) ||
        e.courseTitle.toLowerCase().includes(search);

      const matchesStatus =
        this.status === 'ALL' ||
        (this.status === 'COMPLETED' && e.completed) ||
        (this.status === 'PROGRESS' && !e.completed);

      return matchesSearch && matchesStatus;

    });

    if (
      this.selectedEnrollment &&
      !this.filtered.some(x => x.idEnrollment === this.selectedEnrollment!.idEnrollment)
    ) {
      this.selectedEnrollment = this.filtered[0];
    }

  }

  private unwrap<T>(response: unknown): T {
    const parsed = typeof response === 'string'
      ? JSON.parse(response)
      : response;

    return (parsed as any).data ?? parsed;
  }
}
