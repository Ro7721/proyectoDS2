import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Header } from '../../layout/header/header';
import { Footer } from '../../layout/footer/footer';
import { MenuItem } from 'primeng/api';
type Role = 'STUDENT' | 'TEACHER' | 'ADMIN';
@Component({
  selector: 'app-dashboard-sell',
  imports: [CommonModule, RouterOutlet, Sidebar, Header, Footer],
  templateUrl: './dashboard-sell.html',
  styleUrl: './dashboard-sell.css',
})
export class DashboardSell implements OnInit {

  role: Role = 'TEACHER';
  userName = 'Roger Juro';
  mobileOpen = false;

  studentMenu: MenuItem[] = [
    { label: 'Mi aprendizaje', icon: 'pi pi-book', route: '/dashboard/learning' },
    { label: 'Mi progreso', icon: 'pi pi-chart-line', route: '/dashboard/progress' },
    { label: 'Certificados', icon: 'pi pi-trophy', route: '/dashboard/certificates' },
    { label: 'Wishlist', icon: 'pi pi-heart', route: '/dashboard/wishlist' },
  ];

  teacherMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard/overview-teacher' },
    { label: 'Mis cursos', icon: 'pi pi-book', route: '/dashboard/course-getall' },
    { label: 'Crear curso', icon: 'pi pi-plus', route: '/dashboard/course-insert' },
    { label: 'Estudiantes', icon: 'pi pi-users', route: '/dashboard/students' },
    { label: 'Analíticas', icon: 'pi pi-chart-bar', route: '/dashboard/analytics' },
  ];

  get menu() { return this.role === 'TEACHER' ? this.teacherMenu : this.studentMenu; }
  get pageTitle() { return this.role === 'TEACHER' ? 'Panel Docente' : 'Mi Aprendizaje'; }

  ngOnInit() {
    const saved = localStorage.getItem('role') as Role;
    if (saved) this.role = saved;
  }
}
