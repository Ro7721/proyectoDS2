import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { LessonContentResponse } from '../../../../models/learning.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lesson-sidebar',
  imports: [CommonModule, FormsModule],
  templateUrl: './lesson-sidebar.html',
  styleUrl: './lesson-sidebar.css',
})
export class LessonSidebar implements OnChanges {
  @Input({ required: true }) lessons: LessonContentResponse[] = [];
  @Input() selectedLesson?: LessonContentResponse;
  @Output() lessonSelected = new EventEmitter<LessonContentResponse>();

  searchQuery = '';
  filteredLessons: LessonContentResponse[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lessons']) {
      this.applySearch();
    }
  }

  select(lesson: LessonContentResponse): void {
    this.lessonSelected.emit(lesson);
  }

  isSelected(lesson: LessonContentResponse): boolean {
    return this.selectedLesson?.idLesson === lesson.idLesson;
  }

  onSearch(): void {
    this.applySearch();
  }

  private applySearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredLessons = [...this.lessons];
    } else {
      this.filteredLessons = this.lessons.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q)
      );
    }
  }

  typeIcon(lesson: LessonContentResponse): string {
    switch (lesson.type?.toUpperCase()) {
      case 'VIDEO': return 'play_circle';
      case 'PDF': return 'picture_as_pdf';
      default: return 'article';
    }
  }

  get completedCount(): number {
    return this.lessons.filter(l => l.completed).length;
  }

  get pendingCount(): number {
    return this.lessons.filter(l => !l.completed).length;
  }

  get overallProgress(): number {
    if (!this.lessons.length) return 0;
    return Math.round((this.completedCount / this.lessons.length) * 100);
  }
}
