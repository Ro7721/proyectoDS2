import { CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { Footer } from '../../layout/footer/footer';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { ToastModule } from "primeng/toast";
type Role = 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN';
@Component({
  selector: 'app-dashboard-sell',
  imports: [CommonModule, RouterOutlet, Sidebar, Header, Footer, ToastModule],
  templateUrl: './dashboard-sell.html',
  styleUrl: './dashboard-sell.css',
})
export class DashboardSell implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  messageService = inject(MessageService);

  role: Role = 'ROLE_STUDENT';
  userName = '';
  mobileOpen = false;


  studentMenu: MenuItem[] = [
    { label: 'Mi aprendizaje', icon: 'pi pi-book', route: '/dashboard/learning' },
    { label: 'Mi progreso', icon: 'pi pi-chart-line', route: '#' },
    { label: 'Certificados', icon: 'pi pi-trophy', route: '#' },
    { label: 'Wishlist', icon: 'pi pi-heart', route: '#' },
  ];

  teacherMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard/overview-teacher' },
    { label: 'Mis cursos', icon: 'pi pi-book', route: '/dashboard/course-getall' },
    { label: 'Crear curso', icon: 'pi pi-plus', route: '/dashboard/course-insert' },
    { label: 'Estudiantes', icon: 'pi pi-users', route: '/dashboard/student-getall' },
    { label: 'Analíticas', icon: 'pi pi-chart-bar', route: '#' },
  ];

  get menu() { return this.role === 'ROLE_TEACHER' ? this.teacherMenu : this.studentMenu; }
  get pageTitle() { return this.role === 'ROLE_TEACHER' ? 'Panel Docente' : 'Mi Aprendizaje'; }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.user;
    if (user === null) {
      return;
    }
    this.userName = `${user.firstName} ${user.surName}`;
    this.role = user.role as Role;

    const welcome = sessionStorage.getItem('welcomeShown');
    if (!welcome) {
      this.messageService.add(
        {
          severity: 'success',
          summary: '¡Bienvenido de vuelta!',
          detail: `${user.firstName} ${user.surName}`,
          life: 4000,
        }
      )
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }
}
