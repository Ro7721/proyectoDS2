import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../api/api';
import { getPublicCourses } from '../../api/functions';
import { CourseCardResponse } from '../../models/course.model';
import { CourseCard } from '../../features/coursecard/course-card/course-card';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MatIconModule, CourseCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly api = inject(Api);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  isMenuOpen = false;
  profileOpen = false;
  publicCourses: CourseCardResponse[] = [];
  loadingCourses = true;
  coursesLoadError = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loadingCourses = false;
      return;
    }

    this.loadPublicCourses();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.profileOpen = false;
    }
  }

  goToDashboard() {
    this.profileOpen = false;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/' }
      });
      return;
    }
    this.router.navigate(this.authService.getRoleHomeUrl());
  }

  get dashboardLabel(): string {
    const role = this.authService.currentRole;
    if (role === 'ROLE_ADMIN') return 'Gestión';
    if (role === 'ROLE_TEACHER') return 'Panel Docente';
    return 'Mis Cursos';
  }

  get dashboardIcon(): string {
    const role = this.authService.currentRole;
    if (role === 'ROLE_ADMIN') return 'admin_panel_settings';
    if (role === 'ROLE_TEACHER') return 'dashboard';
    return 'school';
  }

  logout() {
    this.profileOpen = false;
    this.authService.logout();
  }

  private loadPublicCourses(): void {
    this.loadingCourses = true;
    this.coursesLoadError = false;

    this.api.invoke(getPublicCourses).then((response: any) => {
      this.publicCourses = response?.data ?? [];
      this.loadingCourses = false;
      this.cdr.markForCheck();
    })
      .catch((error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar cursos publicos',
        });
        this.publicCourses = [];
        this.loadingCourses = false;
        this.coursesLoadError = true;
        this.cdr.markForCheck();
      });
  }
}

