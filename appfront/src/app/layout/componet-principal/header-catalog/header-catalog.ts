import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-catalog',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header-catalog.html',
  styleUrl: './header-catalog.css',
})
export class HeaderCatalog {
  @Output() searchChange = new EventEmitter<string>();

  value: string = '';
  isFocused = false;

  constructor(private readonly router: Router) {}

  onInput(): void {
    this.searchChange.emit(this.value);
  }

  clearSearch(): void {
    this.value = '';
    this.searchChange.emit('');
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
