import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CourseContentResponse } from '../../../../models/learning.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-learnin-header',
  imports: [DatePipe],
  templateUrl: './learnin-header.html',
  styleUrl: './learnin-header.css',
})
export class LearninHeader {
  @Input({ required: true }) course!: CourseContentResponse;
  private readonly router = inject(Router);

  private readonly SPINE_PALETTE = [
    '#E8592B',
    '#178A4C',
    '#2563EB',
    '#9333EA',
    '#C2410C',
  ];

  /** Iniciales del docente para el avatar (ej. "Carlos Martínez" -> "CM") */
  get teacherInitials(): string {
    return this.course.teacherFullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  /** Color estable por categoría, sin depender de un campo extra del backend */
  get categorySpineColor(): string {
    const hash = [...this.course.categoryName].reduce(
      (acc, char) => acc + (char.codePointAt(0) || 0),
      0
    );
    const palette = LearninHeader.SPINE_PALETTE;
    return palette[hash % palette.length];
  }

  goBack(): void {
    this.router.navigate(['/dashboard/my-courses']);
  }
}
