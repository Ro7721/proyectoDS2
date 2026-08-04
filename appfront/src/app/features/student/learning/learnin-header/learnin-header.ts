import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CourseContentResponse } from '../../../../models/learning.model';
import { DatePipe, CommonModule } from '@angular/common';

const SPINE_PALETTE = [
  '#E8592B',
  '#178A4C',
  '#2563EB',
  '#9333EA',
  '#C2410C',
];

@Component({
  selector: 'app-learnin-header',
  imports: [CommonModule, DatePipe],
  templateUrl: './learnin-header.html',
  styleUrl: './learnin-header.css',
})
export class LearninHeader {
  @Input({ required: true }) course!: CourseContentResponse;
  private readonly router = inject(Router);

  imageError = false;

  onImageError(): void {
    this.imageError = true;
  }

  /** Iniciales del docente para el avatar (ej. "Carlos Martínez" -> "CM") */
  get teacherInitials(): string {
    if (!this.course?.teacherFullName) return 'DOC';
    return this.course.teacherFullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  /** Color estable por categoría, sin depender de un campo extra del backend */
  get categorySpineColor(): string {
    if (!this.course?.categoryName) return SPINE_PALETTE[0];
    const hash = [...this.course.categoryName].reduce(
      (acc, char) => acc + (char.codePointAt(0) || 0),
      0
    );
    return SPINE_PALETTE[hash % SPINE_PALETTE.length];
  }

  goBack(): void {
    this.router.navigate(['/dashboard/my-courses']);
  }
}

