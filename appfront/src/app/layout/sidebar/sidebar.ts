import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageToast } from '../../message/message-toast';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, ToastModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() menu: MenuItem[] = [];
  @Input() role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' = 'ROLE_TEACHER';
  @Input() isCollapsed = false;
  @Output() expand = new EventEmitter<void>();

  private openedMenus: Record<string, boolean> = {};

  constructor(private toast: MessageToast, private authService: AuthService, private router: Router) { }

  async logout() {
    this.authService.logout();
    this.toast.toastSuccess('Éxito', 'Cerraste sesión correctamente');
  }

  onItemClick(event: Event) {
    if (this.isCollapsed) {
      event.preventDefault();
      this.expand.emit();
    }
  }

  toggleSubmenu(label: string, event?: Event): void {
    if (this.isCollapsed) {
      event?.preventDefault();
      this.expand.emit();
    } else {
      this.openedMenus[label] = !this.openedMenus[label];
    }
  }

  isOpen(label: string): boolean {
    return this.openedMenus[label] ?? false;
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.items?.length) {
      return false;
    }
    return item.items.some(child =>
      this.router.url === child['route']
    );
  }
  returnHome() {
    this.router.navigate(['']);
  }
}
