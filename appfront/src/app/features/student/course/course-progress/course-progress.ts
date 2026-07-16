import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-progress',
  imports: [CommonModule],
  templateUrl: './course-progress.html',
  styleUrl: './course-progress.css',
})
export class CourseProgress {
  @Input() progress = 0;
  @Input() completed = false;
  @Output() showCertificate = new EventEmitter<void>();

  get clampedProgress(): number {
    return Math.max(0, Math.min(100, this.progress ?? 0));
  }

  get statusLabel(): string {
    return this.completed ? 'Completado' : 'En progreso';
  }

  onShowCertificate(): void {
    this.showCertificate.emit();
  }
}
