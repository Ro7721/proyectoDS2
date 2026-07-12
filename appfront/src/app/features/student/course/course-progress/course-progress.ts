import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-course-progress',
  imports: [],
  templateUrl: './course-progress.html',
  styleUrl: './course-progress.css',
})
export class CourseProgress {
  @Input() progress = 0;
  @Input() completed = false;

  get clampedProgress(): number {
    return Math.max(0, Math.min(100, this.progress ?? 0));
  }

  get statusLabel(): string {
    return this.completed ? 'Completado' : 'En progreso';
  }
}
