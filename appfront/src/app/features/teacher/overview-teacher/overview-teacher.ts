import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Api } from '../../../api/api';
import { findByTeacher, getTeacherEnrollments, FindByTeacher$Params } from '../../../api/functions';
import { CourseResponse } from '../../../models/course.model';
import { TeacherEnrollmentResponse } from '../../../models/teacher.model';
import { MessageToast } from '../../../message/message-toast';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-overview-teacher',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './overview-teacher.html',
  styleUrl: './overview-teacher.css',
})
export class OverviewTeacher implements OnInit {

  private cdk = inject(ChangeDetectorRef);
  mobileOpen = false;
  loading = true;

  realCourses: CourseResponse[] = [];
  realEnrollments: TeacherEnrollmentResponse[] = [];

  // Mapped list for the UI (using real data)
  courses: { title: string, subtitle: string, progress: number, color: string, id: string }[] = [];

  // Stats
  totalStudents = 0;
  totalCourses = 0;
  totalIncome = 0; // mocked as enrollments * average price
  completionRate = 0;
  totalCompleted = 0;

  private colors = ['#5035B2', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  constructor(private api: Api, private toast: MessageToast, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.loading = true;
    try {
      const teacherId = this.authService.user?.idUser || '';
      const [coursesRes, enrollmentsRes] = await Promise.all([
        this.api.invoke(findByTeacher, { teacherId } as FindByTeacher$Params),
        this.api.invoke(getTeacherEnrollments)
      ]);

      const coursesData = (coursesRes as any).data || coursesRes;
      const enrollmentsData = (enrollmentsRes as any).data || enrollmentsRes;

      if (Array.isArray(coursesData)) {
        this.realCourses = coursesData;
      }

      if (Array.isArray(enrollmentsData)) {
        this.realEnrollments = enrollmentsData;
      }

      this.calculateStats();
      this.mapCoursesForUI();

    } catch (error: any) {
      this.toast.toastError('Error al cargar datos del dashboard');
    } finally {
      this.loading = false;
      this.cdk.detectChanges();
    }
  }

  private calculateStats() {
    this.totalCourses = this.realCourses.length;
    this.totalStudents = this.realEnrollments.length;

    // Average completion
    const completed = this.realEnrollments.filter(e => e.completed).length;
    this.totalCompleted = completed;
    this.completionRate = this.totalStudents > 0 ? Math.round((completed / this.totalStudents) * 100) : 0;

    // Mock income (sum of prices for active enrollments)
    let income = 0;
    this.realEnrollments.forEach(e => {
      const course = this.realCourses.find(c => c.idCourse === e.idCourse);
      if (course) {
        income += course.price || 0;
      }
    });
    this.totalIncome = income;
  }

  private mapCoursesForUI() {
    this.courses = this.realCourses.map((c, index) => {
      // Find avg progress for this course
      const enrolls = this.realEnrollments.filter(e => e.idCourse === c.idCourse);
      const avgProgress = enrolls.length > 0
        ? Math.round(enrolls.reduce((sum, e) => sum + e.totalProgress, 0) / enrolls.length)
        : 0;

      return {
        id: c.idCourse,
        title: c.title,
        subtitle: c.categoryName + ' - ' + c.totalLessons + ' lecciones',
        progress: avgProgress,
        color: this.colors[index % this.colors.length]
      };
    });
  }

  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }
}
