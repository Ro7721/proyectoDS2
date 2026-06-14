import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  @Input() menu: MenuItem[] = [];
  @Input() role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' = 'ROLE_TEACHER';
  private authService = inject(AuthService);
  messageService = inject(MessageService);

  async logout() {
    this.authService.logout();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cerraste sesión correctamente',
    });
  }

}
