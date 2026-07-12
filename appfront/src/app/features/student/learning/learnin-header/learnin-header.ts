import { Component, Input } from '@angular/core';
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

  /** Paleta acotada para el filete lateral; se elige según la categoría */
  private static readonly SPINE_PALETTE = [
    '#E8592B', // accent principal
    '#178A4C', // success
    '#2563EB', // azul
    '#9333EA', // violeta
    '#C2410C', // ámbar oscuro
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
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    const palette = LearninHeader.SPINE_PALETTE;
    return palette[hash % palette.length];
  }
}
