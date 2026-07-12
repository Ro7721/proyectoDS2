import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MyCourseResponse } from '../../../../models/enrollment.model';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { apiMyCourses } from '../../../../api/functions';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.css',
})
export class MyCourses implements OnInit {

  private changeDetector = inject(ChangeDetectorRef);
  courses: MyCourseResponse[] = [];
  loading = true;

  constructor(private api: Api, private toast: MessageToast, private router: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.loading = true;
    this.api.invoke(apiMyCourses).then((response: any) => {
      const apiResponse = typeof response === 'string' ? JSON.parse(response) : response;

      if (Array.isArray(apiResponse)) {
        this.courses = apiResponse;
      } else if (apiResponse.success) {
        this.courses = apiResponse.data ?? apiResponse;
      } else {
        this.toast.toastError(' Error al cargar los cursos: ' + (apiResponse.error?.message || 'Error desconocido'));
      }

      this.loading = false;
      this.changeDetector.detectChanges();
    }).catch((error: any) => {
      this.toast.toastError(' Error al cargar los cursos: ' + error.message);
      this.loading = false;
    });
  }

  exploreCourses() {
    this.router.navigate(['/catalog']);
  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  }

  continueCourse(course: MyCourseResponse) {
    this.router.navigate(['/dashboard/learning/course', course.idCourse]);
  }
}
