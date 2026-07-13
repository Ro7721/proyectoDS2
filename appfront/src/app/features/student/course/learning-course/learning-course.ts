import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../../api/api';
import { CourseContentResponse, LessonContentResponse } from '../../../../models/learning.model';
import { apiCourseContent, apiSaveProgress } from '../../../../api/functions';
import { CommonModule } from '@angular/common';
import { CourseProgress } from '../course-progress/course-progress';
import { LearninHeader } from '../../learning/learnin-header/learnin-header';
import { LessonSidebar } from '../../learning/lesson-sidebar/lesson-sidebar';

import { LessonPlayer } from '../../learning/lesson-player/lesson-player';
import { LessonResource } from '../../learning/lesson-resource/lesson-resource';

export interface LessonProgressEvent {
  idLesson: string;
  watchedPercentage: number;
  lastPositionSeconds: number;
}

@Component({
  selector: 'app-learning-course',
  imports: [CommonModule, CourseProgress, LearninHeader, LessonSidebar, LessonPlayer, LessonResource],
  templateUrl: './learning-course.html',
  styleUrl: './learning-course.css',
})
export class LearningCourse implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = true;
  course?: CourseContentResponse;
  selectedLesson?: LessonContentResponse;

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
    this.selectedLesson = data?.lessons?.[0];
  }

  onLessonSelected(lesson: LessonContentResponse): void {
    this.selectedLesson = lesson;
    this.cdr.markForCheck();
  }
  onLessonProgress(event: LessonProgressEvent): void {
    this.api
      .invoke(apiSaveProgress, { body: event })
      .then((response) => this.handleProgressSaved(response))
      .catch((err) => console.error('Error guardando progreso', err));
  }

  private handleProgressSaved(response: unknown): void {
    const progress = this.unwrap<{ totalProgress: number; courseCompleted: boolean }>(
      response
    );
    if (!progress || !this.course) {
      return;
    }
    this.course.totalProgress = progress.totalProgress;
    this.course.completed = progress.courseCompleted;
    this.cdr.markForCheck();
  }

  /** Normaliza la respuesta de la API, ya venga como texto o ya envuelta en { data } */
  private unwrap<T>(response: unknown): T | undefined {
    const parsed =
      typeof response === 'string' ? JSON.parse(response) : response;
    return (parsed as { data?: T })?.data ?? (parsed as T);
  }
}
