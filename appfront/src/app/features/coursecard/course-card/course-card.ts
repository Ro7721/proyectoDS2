import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CourseCardResponse } from '../../../models/course.model';

@Component({
  selector: 'app-course-card',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
})
export class CourseCard {
  @Input({ required: true }) course!: CourseCardResponse;

  readonly fallbackImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800';

  formatPrice(price: number | null | undefined): string {
    if (!price) {
      return 'Gratis';
    }

    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  }
}
