import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, InputTextModule, IconFieldModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  sidebarVisible = signal<boolean>(false);

  @Input() title = 'Dashboard';
  @Input() userName = 'Usuario';
  @Input() role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' = 'ROLE_STUDENT';

  @Output() menuToggle = new EventEmitter<void>();

  toggleSidebar() {
    this.sidebarVisible.update((value) => !value);
    this.menuToggle.emit();
  }

  get initials(): string {

    if (!this.userName.trim()) {
      return '?';
    }
    const words = this.userName
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (
      words[0][0] +
      words[1][0]
    ).toUpperCase();
  }
} 
