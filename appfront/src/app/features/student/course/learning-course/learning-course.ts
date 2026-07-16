import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../../api/api';
import { CourseContentResponse, LessonContentResponse, CourseProgressResponse, CertificateResponse } from '../../../../models/learning.model';
import { apiCourseContent, apiSaveProgress, apiCertificate } from '../../../../api/functions';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { CourseProgress } from '../course-progress/course-progress';
import { LearninHeader } from '../../learning/learnin-header/learnin-header';
import { LessonSidebar } from '../../learning/lesson-sidebar/lesson-sidebar';
import { LessonPlayer } from '../../learning/lesson-player/lesson-player';
import { LessonResource } from '../../learning/lesson-resource/lesson-resource';
import { CertificateModal } from '../../learning/certificate-modal/certificate-modal';
import { AuthService } from '../../../../core/auth/auth.service';

export interface LessonProgressEvent {
  idLesson: string;
  watchedPercentage: number;
  lastPositionSeconds: number;
  saveToBackend?: boolean;
}

@Component({
  selector: 'app-learning-course',
  imports: [CommonModule, CourseProgress, LearninHeader, LessonSidebar, LessonPlayer, LessonResource, CertificateModal],
  templateUrl: './learning-course.html',
  styleUrl: './learning-course.css',
})
export class LearningCourse implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);

  loading = true;
  course?: CourseContentResponse;
  selectedLesson?: LessonContentResponse;

  // Certificate
  showCertificateModal = false;
  showCompletedOverlay = false;
  private wasCompleted = false;
  certificateData?: CertificateResponse;

  get studentName(): string {
    const user = this.authService.user;
    if (!user) return 'Estudiante';
    return `${user.firstName ?? ''} ${user.surName ?? ''}`.trim() || user.email || 'Estudiante';
  }

  ngOnInit(): void {
    const idCourse = this.route.snapshot.paramMap.get('idCourse');
    if (idCourse) {
      this.loadCourse(idCourse);
    }
  }

  /** Carga el contenido del curso y selecciona la primera lección */
  private loadCourse(idCourse: string): void {
    this.loading = true;
    this.api
      .invoke(apiCourseContent, { idCourse })
      .then((response) => this.handleCourseLoaded(response))
      .catch((err) => console.error('Error cargando el curso', err))
      .finally(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private handleCourseLoaded(response: unknown): void {
    const data = this.unwrap<CourseContentResponse>(response);
    this.course = data;
    this.wasCompleted = data?.completed ?? false;
    // Select first incomplete lesson, or first lesson
    if (data?.lessons?.length) {
      const firstIncomplete = data.lessons.find(l => !l.completed);
      this.selectedLesson = firstIncomplete ?? data.lessons[0];
    }
  }

  onLessonSelected(lesson: LessonContentResponse): void {
    this.selectedLesson = lesson;
    this.cdr.markForCheck();
  }

  onLessonCompleted(): void {
    // The lessonProgress event will handle backend save + progress update
  }

  onLessonProgress(event: LessonProgressEvent): void {
    // 1. Actualizar el frontend inmediatamente
    if (this.course) {
      const lesson = this.course.lessons?.find(l => l.idLesson === event.idLesson);
      if (lesson) {
        if (!lesson.completed) {
          lesson.watchedPercentage = event.watchedPercentage;
          lesson.lastPositionSeconds = event.lastPositionSeconds;
          if (event.watchedPercentage === 100) {
            lesson.completed = true;
          }
        }
      }
      this.cdr.markForCheck();
    }

    // 2. Si saveToBackend es true, invocar API para persistir en la base de datos
    if (event.saveToBackend) {
      const body = {
        idLesson: event.idLesson,
        watchedPercentage: event.watchedPercentage,
        lastPositionSeconds: event.lastPositionSeconds
      };
      this.api
        .invoke(apiSaveProgress, { body }).then((response) => this.handleProgressSaved(response))
        .catch((err) => console.error('Error guardando progreso', err));
    }
  }

  private handleProgressSaved(response: unknown): void {
    const progress = this.unwrap<CourseProgressResponse>(response);
    if (!progress || !this.course) {
      return;
    }

    const wasAlreadyDone = this.wasCompleted;
    this.course.totalProgress = progress.totalProgress;
    this.course.completed = progress.courseCompleted;

    const lesson = this.course.lessons?.find(l => l.idLesson === progress.idLesson);
    if (lesson) {
      lesson.completed = progress.lessonCompleted;
      lesson.watchedPercentage = progress.watchedPercentage;
      lesson.lastPositionSeconds = progress.lastPositionSeconds;
    }

    // Show completion overlay only once
    if (progress.courseCompleted && !wasAlreadyDone) {
      this.wasCompleted = true;
      this.showCompletedOverlay = true;
    }

    this.cdr.markForCheck();
  }

  async openCertificate(): Promise<void> {
    if (!this.course) return;
    try {
      const res: any = await this.api.invoke(apiCertificate, { idCourse: this.course.idCourse });
      const apiResponse = typeof res === 'string' ? JSON.parse(res) : res;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.response?.listMessage?.[0] || 'Error al obtener certificado');
      }
      
      this.certificateData = apiResponse.data;
      this.showCertificateModal = true;
      this.cdr.markForCheck();
    } catch (err: any) {
      console.error(err);
      alert('No se pudo cargar el certificado. ' + (err.message || err));
    }
  }

  dismissOverlay(): void {
    this.showCompletedOverlay = false;
  }

  /** Normaliza la respuesta de la API, ya venga como texto o ya envuelta en { data } */
  private unwrap<T>(response: unknown): T | undefined {
    const parsed =
      typeof response === 'string' ? JSON.parse(response) : response;
    return (parsed as { data?: T })?.data ?? (parsed as T);
  }
}
