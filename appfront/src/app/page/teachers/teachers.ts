import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../api/api';
import { getAllUsers, findByTeacher } from '../../api/functions';
import { UserResponse } from '../../api/models/user-response';

interface TeacherCard {
  idUser: string;
  firstName: string;
  surName: string;
  email: string;
  initials: string;
  courseCount: number;
  color: string;
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-emerald-500', 'bg-blue-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
  'bg-indigo-500', 'bg-teal-500',
];

@Component({
  selector: 'app-teachers',
  imports: [CommonModule, RouterLink],
  templateUrl: './teachers.html',
})
export class Teachers implements OnInit {
  loading = true;
  teachers: TeacherCard[] = [];
  searchQuery = '';

  constructor(private readonly api: Api, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  async loadTeachers(): Promise<void> {
    this.loading = true;
    try {
      const response: any = await this.api.invoke(getAllUsers);
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      const users: UserResponse[] = Array.isArray(parsed) ? parsed : (parsed.data ?? []);

      // Filtrar solo docentes activos
      const teacherUsers = users.filter(u => u.role === 'ROLE_TEACHER' && u.active !== false);

      // Cargar conteo de cursos por docente en paralelo
      this.teachers = await Promise.all(
        teacherUsers.map(async (u, idx) => {
          let courseCount = 0;
          try {
            const cRes: any = await this.api.invoke(findByTeacher, { teacherId: u.idUser! });
            const parsed2 = typeof cRes === 'string' ? JSON.parse(cRes) : cRes;
            const courses = Array.isArray(parsed2) ? parsed2 : (parsed2.data ?? []);
            courseCount = courses.length;
          } catch { /* ignore */ }
          return {
            idUser: u.idUser!,
            firstName: u.firstName ?? '',
            surName: u.surName ?? '',
            email: u.email ?? '',
            initials: ((u.firstName?.charAt(0) ?? '') + (u.surName?.charAt(0) ?? '')).toUpperCase(),
            courseCount,
            color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
          };
        })
      );
    } catch (err) {
      console.error('Error loading teachers', err);
      this.teachers = [];
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get filteredTeachers(): TeacherCard[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.teachers;
    return this.teachers.filter(t =>
      t.firstName.toLowerCase().includes(q) ||
      t.surName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }
}
