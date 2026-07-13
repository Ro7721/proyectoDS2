import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LessonContentResponse } from '../../../../models/learning.model';

@Component({
  selector: 'app-lesson-sidebar',
  imports: [],
  templateUrl: './lesson-sidebar.html',
  styleUrl: './lesson-sidebar.css',
})
export class LessonSidebar {
  @Input({ required: true }) lessons: LessonContentResponse[] = [];
  @Input() selectedLesson?: LessonContentResponse;

  @Output() lessonSelected = new EventEmitter<LessonContentResponse>();

  select(lesson: LessonContentResponse): void {
    this.lessonSelected.emit(lesson);
  }

  isSelected(lesson: LessonContentResponse): boolean {
    return this.selectedLesson?.idLesson === lesson.idLesson;
  }

  /** Ícono según el tipo de contenido de la lección */
  iconFor(lesson: LessonContentResponse): string {
    switch (lesson.type.toUpperCase()) {
      case 'VIDEO':
        return 'play_circle';
      case 'PDF':
        return 'picture_as_pdf';
      default:
        return 'article';
    }
  }

  trackByLesson(_index: number, lesson: LessonContentResponse): string {
    return lesson.idLesson;
  }
  progressColor(lesson: LessonContentResponse): string {

    if (lesson.completed) return '#16a34a';
    if (lesson.watchedPercentage > 0) return '#2563eb';
    return '#d1d5db';
  }

  statusIcon(lesson: LessonContentResponse): string {
    if (lesson.completed) {
      return 'check_circle';
    }
    if (lesson.watchedPercentage > 0) {
      return 'play_circle';
    }
    return 'radio_button_unchecked';

  }

  statusLabel(lesson: LessonContentResponse): string {
    if (lesson.completed) {
      return 'Completada';
    }
    if (lesson.watchedPercentage > 0) {
      return `${lesson.watchedPercentage}% visto`;
    }
    return 'Sin iniciar';
  }
}
