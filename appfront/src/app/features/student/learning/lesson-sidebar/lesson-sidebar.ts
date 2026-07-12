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
}
