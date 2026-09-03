import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { ThemeService } from '../../core/services/theme.service';
import { UnreadMessagesService } from '../../core/services/unread-messages.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, BadgeModule, InputTextModule, IconFieldModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly themeService = inject(ThemeService);
  readonly unreadMessages = inject(UnreadMessagesService);
  private readonly router = inject(Router);

  sidebarVisible = signal<boolean>(false);

  @Input() title = 'Dashboard';
  @Input() userName = 'Usuario';
  @Input() role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' = 'ROLE_STUDENT';

  @Output() menuToggle = new EventEmitter<void>();

  toggleSidebar() {
    this.sidebarVisible.update((value) => !value);
    this.menuToggle.emit();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  goToMessages() {
    void this.router.navigate(['/dashboard/messages']);
  }

  get initials(): string {
    if (!this.userName.trim()) return '?';
    const words = this.userName.trim().split(/\s+/);
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
