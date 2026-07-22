import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../../../api/api';
import { getAllCourses, publishCourse, deleteCourse } from '../../../../api/functions';
import { unpublishCourse } from '../../../../api/fn/course-controller/unpublish-course';
import { CourseResponse } from '../../../../api/models/course-response';
import { MessageToast } from '../../../../message/message-toast';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css'
})
export class AdminCoursesComponent implements OnInit {
  courses: CourseResponse[] = [];
  filteredCourses: CourseResponse[] = [];
  loading = true;
  searchQuery = '';
  filterStatus = '';

  showDeleteModal = false;
  courseToDelete: CourseResponse | null = null;
  actionLoading = false;

  constructor(private api: Api, private toast: MessageToast, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    Promise.resolve().then(() => this.loadCourses());
  }

  loadCourses() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.invoke(getAllCourses).then((response: any) => {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      if (Array.isArray(parsed)) {
        this.courses = parsed;
      } else if (parsed.data) {
        this.courses = parsed.data;
      } else {
        this.courses = [];
      }
      this.applyFilters();
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cargar los cursos');
      console.error(err);
    }).finally(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  applyFilters() {
    let result = [...this.courses];
    const q = this.searchQuery.toLowerCase();
    if (q) {
      result = result.filter(c =>
        (c.title?.toLowerCase() || '').includes(q) ||
        (c.teacherFullName?.toLowerCase() || '').includes(q) ||
        (c.categoryName?.toLowerCase() || '').includes(q)
      );
    }
    if (this.filterStatus) {
      result = result.filter(c => c.status === this.filterStatus);
    }
    this.filteredCourses = result;
  }

  onSearch(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onFilterStatus(event: Event) {
    this.filterStatus = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  togglePublish(course: CourseResponse) {
    if (!course.idCourse) return;
    this.actionLoading = true;
    const isPublished = course.status === 'PUBLISHED';
    const fn = isPublished ? unpublishCourse : publishCourse;
    this.api.invoke(fn, { idCourse: course.idCourse }).then(() => {
      course.status = isPublished ? 'DRAFT' : 'PUBLISHED';
      this.toast.toastSuccess('Éxito', isPublished ? 'Curso despublicado' : 'Curso publicado exitosamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo cambiar el estado del curso');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  openDeleteModal(course: CourseResponse) {
    this.courseToDelete = course;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.courseToDelete = null;
  }

  confirmDelete() {
    if (!this.courseToDelete?.idCourse) return;
    this.actionLoading = true;
    this.api.invoke(deleteCourse, { idCourse: this.courseToDelete.idCourse }).then(() => {
      this.courses = this.courses.filter(c => c.idCourse !== this.courseToDelete!.idCourse);
      this.applyFilters();
      this.closeDeleteModal();
      this.toast.toastSuccess('Éxito', 'Curso eliminado correctamente');
    }).catch(err => {
      this.toast.toastError('Error', 'No se pudo eliminar el curso');
      console.error(err);
    }).finally(() => {
      this.actionLoading = false;
    });
  }

  getStatusLabel(status: string | undefined): string {
    const labels: Record<string, string> = {
      PUBLISHED: 'Publicado',
      DRAFT: 'Borrador',
      ARCHIVED: 'Archivado'
    };
    return labels[status || ''] || status || '';
  }

  getLevelLabel(level: string | undefined): string {
    const labels: Record<string, string> = {
      BEGINNER: 'Básico',
      INTERMEDIATE: 'Intermedio',
      ADVANCED: 'Avanzado'
    };
    return labels[level || ''] || level || '';
  }
}
