import { CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { Footer } from '../../layout/footer/footer';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/auth/auth.service';
import { ToastModule } from "primeng/toast";
import { MessageToast } from '../../message/message-toast';
type Role = 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN';
@Component({
  selector: 'app-dashboard-sell',
  imports: [CommonModule, RouterOutlet, Sidebar, Header, Footer, ToastModule],
  templateUrl: './dashboard-sell.html',
  styleUrl: './dashboard-sell.css',
})
export class DashboardSell implements OnInit {
  private platformId = inject(PLATFORM_ID);

  role: Role = 'ROLE_STUDENT';
  userName = '';
  isSidebarCollapsed = false;
  isMobile = false;
  private sidebarManuallyToggled = false;

  constructor(private toast: MessageToast, private authService: AuthService) {
  }

  studentMenu: MenuItem[] = [
    { label: 'Panel Principal', icon: 'pi pi-th-large', route: '/dashboard/my-courses' },
    {
      label: 'Mi aprendizaje', icon: 'pi pi-book', items: [
        { label: 'Certificados', icon: 'pi pi-trophy', route: '#' },
      ]
    },
    { label: 'Mi perfil', icon: 'pi pi-user', route: '/dashboard/profile' },
    { label: 'Configuracion', icon: 'pi pi-cog', route: '#' },
    { label: 'Ayuda', icon: 'pi pi-question-circle', route: '#' }
  ];

  teacherMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard/overview-teacher' },
    {
      label: 'Cursos', icon: 'pi pi-book', items: [
        { label: 'Crear curso', icon: 'pi pi-plus', route: '/dashboard/course-insert' },
        { label: 'Mis cursos', icon: 'pi pi-book', route: '/dashboard/course-getall' },
        { label: 'Lecciones', icon: 'pi pi-list', route: '/dashboard/lesson-getall' },
      ]
    },
    { label: 'Inscripciones', icon: 'pi pi-ticket', route: '/dashboard/students-enrollments' },
    {
      label: 'Analíticas', icon: 'pi pi-chart-line', items: [
        { label: 'Analíticas', icon: 'pi pi-chart-line', route: '#' },
        { label: 'Reportes', icon: 'pi pi-file-excel', route: '#' },
      ]
    },
    { label: 'Comentarios', icon: 'pi pi-comment', route: '#' },
    { label: 'Certificados', icon: 'pi pi-trophy', route: '#' },
    { label: 'Configuracion', icon: 'pi pi-cog', route: '#' },
    { label: 'Ayuda', icon: 'pi pi-question-circle', route: '#' }
  ];

  adminMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-pie', route: '/dashboard/admin' },
    { label: 'Usuarios', icon: 'pi pi-users', route: '/dashboard/admin/users' },
    { label: 'Cursos', icon: 'pi pi-book', route: '/dashboard/admin/courses' },
    { label: 'Categorías', icon: 'pi pi-tags', route: '/dashboard/admin/categories' },
    { label: 'Inscripciones', icon: 'pi pi-id-card', route: '/dashboard/admin/enrollments' },
    { label: 'Configuracion', icon: 'pi pi-cog', route: '#' },
    { label: 'Ayuda', icon: 'pi pi-question-circle', route: '#' }
  ];

  get menu() {
    if (this.role === 'ROLE_ADMIN') return this.adminMenu;
    return this.role === 'ROLE_TEACHER' ? this.teacherMenu : this.studentMenu;
  }

  get pageTitle() {
    if (this.role === 'ROLE_ADMIN') return 'Panel Administrador';
    return this.role === 'ROLE_TEACHER' ? 'Panel Docente' : 'Mi Aprendizaje';
  }

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.authService.user;
    if (user === null) {
      return;
    }
    this.userName = `${user.firstName} ${user.surName}`;
    this.role = user.role as Role;

    this.checkScreenSize();

    // Mostrar toast de bienvenida después de que el componente esté renderizado
    const welcome = sessionStorage.getItem('welcomeShown');
    if (!welcome) {
      setTimeout(() => {
        this.toast.toastSuccess(
          '¡Bienvenido!',
          `Hola ${user.firstName} ${user.surName}, bienvenido de vuelta`
        );
      }, 300);
      sessionStorage.setItem('welcomeShown', 'true');
    }

  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 1024;
      if (this.isMobile && !this.sidebarManuallyToggled) {
        this.isSidebarCollapsed = true;
      } else if (!this.isMobile && !this.sidebarManuallyToggled) {
        this.isSidebarCollapsed = false;
      }
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarManuallyToggled = true;
  }
}
