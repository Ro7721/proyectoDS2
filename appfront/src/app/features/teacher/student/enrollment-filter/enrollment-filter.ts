import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-enrollment-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './enrollment-filter.html',
  styleUrl: './enrollment-filter.css',
})
export class EnrollmentFilter {
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();

  search = '';
  status = 'ALL';

  statusOptions = [
    { label: 'Todos', value: 'ALL' },
    { label: 'En progreso', value: 'PROGRESS' },
    { label: 'Completados', value: 'COMPLETED' },
  ];

  onSearch(): void {
    this.searchChange.emit(this.search);
  }

  setStatus(value: string): void {
    this.status = value;
    this.statusChange.emit(this.status);
  }
}
