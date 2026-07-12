import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../api/api';
import { PublicCourseCard$Params, publicCourseCard } from '../../api/functions';
import { CourseCardResponse } from '../../models/course.model';
import { CourseCard } from '../../features/coursecard/course-card/course-card';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MatIconModule, CourseCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  authService = inject(AuthService);

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

  goToMyCourses() {
    this.profileOpen = false;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard/my-courses' }
      });
      return;
    }
    this.router.navigate(['/dashboard/my-courses']);
  }

  logout() {
    this.profileOpen = false;
    this.authService.logout();
  }

  private loadPublicCourses(): void {
    this.loadingCourses = true;
    this.coursesLoadError = false;

    this.api.invoke<PublicCourseCard$Params, any>(publicCourseCard)
      .then((response) => {
        this.publicCourses = response?.data ?? [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      });
  }
}

