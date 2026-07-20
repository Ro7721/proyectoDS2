import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeacherEnrollmentResponse } from '../../../../models/teacher.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-enrollment-card',
  imports: [CommonModule, DatePipe],
  templateUrl: './enrollment-card.html',
  styleUrl: './enrollment-card.css',
})
export class EnrollmentCard {
  @Input({ required: true }) enrollment!: TeacherEnrollmentResponse;
  @Input() selected = false;

  @Output() selectedChange = new EventEmitter<void>();

  select(): void {
    this.selectedChange.emit();
  }
  get progressColor(): string {
    if (this.enrollment.totalProgress >= 100) return 'var(--color-success)';
    if (this.enrollment.totalProgress >= 60) return 'var(--color-info)';
    return 'var(--color-accent)';
  }
}
