import { Injectable, inject } from '@angular/core';
import { Api } from '../../../../api/api';
import { apiTeacherenrollments } from '../../../../api/functions';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';
import { MessageToast } from '../../../../message/message-toast';


export interface CourseSummary {
  courseTitle: string;
  total: number;
  completed: number;
  progress: number;
}


@Injectable({ providedIn: 'root' })
export class TeacherEnrollmentsService {
  private api = inject(Api);
  private toast = inject(MessageToast);

  async getEnrollments(): Promise<TeacherEnrollmentResponse[]> {
    try {
      const response: any = await this.api.invoke(apiTeacherenrollments);
      return this.unwrap<TeacherEnrollmentResponse[]>(response) ?? [];
    } catch (error: any) {
      this.toast.toastError(
        'Error al cargar inscripciones',
        error?.message || 'No se pudieron obtener los datos de inscripciones.'
      );
      return [];
    }
  }


  computeCourseSummary(enrollments: TeacherEnrollmentResponse[]): CourseSummary[] {
    const map = new Map<string, CourseSummary>();

    for (const e of enrollments) {
      if (!map.has(e.courseTitle)) {
        map.set(e.courseTitle, {
          courseTitle: e.courseTitle,
          total: 0,
          completed: 0,
          progress: 0,
        });
      }
      const stat = map.get(e.courseTitle)!;
      stat.total++;
      if (e.completed) {
        stat.completed++;
      } else {
        stat.progress++;
      }
    }

    return Array.from(map.values());
  }


  filterEnrollments(
    enrollments: TeacherEnrollmentResponse[],
    search: string,
    status: string
  ): TeacherEnrollmentResponse[] {
    const term = search.toLowerCase();

    return enrollments.filter(e => {
      const matchesSearch =
        e.studentFullName.toLowerCase().includes(term) ||
        e.courseTitle.toLowerCase().includes(term);

      const matchesStatus =
        status === 'ALL' ||
        (status === 'COMPLETED' && e.completed) ||
        (status === 'PROGRESS' && !e.completed);

      return matchesSearch && matchesStatus;
    });
  }


  private unwrap<T>(response: unknown): T {
    const parsed = typeof response === 'string'
      ? JSON.parse(response)
      : response;
    return (parsed as any).data ?? parsed;
  }
}
