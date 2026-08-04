import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private readonly router = inject(Router);
  authService = inject(AuthService);

  isMenuOpen = false;
  profileOpen = false;

  pillars = [
    {
      icon: 'school',
      title: 'Aprendizaje flexible',
      text: 'Cursos disponibles para avanzar a tu ritmo, desde cualquier lugar y con contenidos organizados por nivel.',
    },
    {
      icon: 'groups',
      title: 'Docentes cercanos',
      text: 'Profesores que crean lecciones claras, acompanian el progreso y convierten la experiencia en algo aplicable.',
    },
    {
      icon: 'verified',
      title: 'Progreso visible',
      text: 'Seguimiento de cursos, constancias y rutas de aprendizaje pensadas para sostener la motivacion.',
    },
  ];

  values = ['Acceso simple', 'Contenido practico', 'Crecimiento continuo', 'Comunidad educativa'];

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
        queryParams: { returnUrl: '/dashboard/my-courses' },
      });
      return;
    }
    this.router.navigate(['/dashboard/my-courses']);
  }

  logout() {
    this.profileOpen = false;
    this.authService.logout();
  }
}
