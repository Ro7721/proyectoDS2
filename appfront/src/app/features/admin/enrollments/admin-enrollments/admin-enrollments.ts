import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../api/api';
import { getAll, delete1 as deleteEnrollment } from '../../../../api/functions';
import { EnrollmentResponse } from '../../../../api/models/enrollment-response';
import { MessageToast } from '../../../../message/message-toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-enrollments.html',
  styleUrl: './admin-enrollments.css'
})
export class AdminEnrollmentsComponent implements OnInit {
  enrollments: EnrollmentResponse[] = [];
  filteredEnrollments: EnrollmentResponse[] = [];
  loading = true;
  searchQuery = '';
  filterStatus = '';
  actionLoading = false;

  showDeleteModal = false;
  enrollmentToDelete: EnrollmentResponse | null = null;

  constructor(readonly api: Api, private toast: MessageToast, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.loadEnrollments());
  }

  loadEnrollments() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.invoke(getAll).then((response: any) => {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (Array.isArray(parsed)) {
        this.enrollments = parsed;
      } else if (parsed.data) {
        this.enrollments = parsed.data;
      } else {
        this.enrollments = [];
      }
      this.applyFilters();
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cargar las inscripciones');
      console.error(err);
    }).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    let result = [...this.enrollments];
    const q = this.searchQuery.toLowerCase();
    if (q) {
      result = result.filter(e =>
        (e.courseTitle?.toLowerCase() || '').includes(q) ||
        (e.studentName?.toLowerCase() || '').includes(q)
      );
    }
    if (this.filterStatus === 'completed') {
      result = result.filter(e => e.completed);
    } else if (this.filterStatus === 'progress') {
      result = result.filter(e => !e.completed);
    }
    this.filteredEnrollments = result;
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onFilterStatus(event: Event) {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  openDeleteModal(enrollment: EnrollmentResponse) {
    this.enrollmentToDelete = enrollment;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.enrollmentToDelete = null;
  }

  confirmDelete() {
    if (!this.enrollmentToDelete?.idEnrollment) return;
    this.actionLoading = true;
    this.api.invoke(deleteEnrollment, { idEnrollment: this.enrollmentToDelete.idEnrollment }).then(() => {
      this.enrollments = this.enrollments.filter(e => e.idEnrollment !== this.enrollmentToDelete!.idEnrollment);
      this.applyFilters();
      this.closeDeleteModal();
      this.toast.toastSuccess('Éxito', 'Inscripción eliminada correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo eliminar la inscripción');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  getProgressColor(progress: number | undefined): string {
    const p = progress || 0;
    if (p >= 100) return 'bg-emerald-500';
    if (p >= 50) return 'bg-blue-500';
    return 'bg-purple-400';
  }
}
