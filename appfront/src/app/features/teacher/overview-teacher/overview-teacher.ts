import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-overview-teacher',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './overview-teacher.html',
  styleUrl: './overview-teacher.css',
})
export class OverviewTeacher {

  mobileOpen = false;


  courses = [
    { title: 'Curso de React', subtitle: 'Desarrollo web moderno con React 18 y hooks', progress: 85, color: '#5035B2' },
    { title: 'Python para principiantes', subtitle: 'Aprende Python desde cero con ejemplos prácticos', progress: 60, color: '#3B82F6' },
    { title: 'Fundamentos de UX/UI', subtitle: 'Crea interfaces atractivas y fáciles de usar', progress: 45, color: '#10B981' },
    { title: 'Introducción a Java', subtitle: 'Domina los conceptos básicos de Java 17', progress: 30, color: '#F59E0B' },
    { title: 'Desarrollo de aplicaciones móviles', subtitle: 'Crea apps para iOS y Android con React Native', progress: 70, color: '#8B5CF6' },
    { title: 'SQL para análisis de datos', subtitle: 'Extrae información valiosa de bases de datos', progress: 20, color: '#EC4899' },
    { title: 'Desarrollo web full stack', subtitle: 'Crea aplicaciones completas con tecnologías modernas', progress: 55, color: '#06B6D4' },
    { title: 'Introducción a TypeScript', subtitle: 'Tipado estático para JavaScript', progress: 90, color: '#F97316' },
    { title: 'Diseño responsivo', subtitle: 'Crea diseños que funcionan en cualquier dispositivo', progress: 40, color: '#6366F1' },
    { title: 'Introducción a Dart', subtitle: 'Desarrollo multiplataforma con Dart', progress: 25, color: '#0EA5E9' },
  ];
  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }
}
