import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { About } from './page/about/about';
import { Login } from './page/auth/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { RegisterUser } from './page/auth/register-user/register-user';
import { DashboardSell } from './page/dashboard-sell/dashboard-sell';
import { CourseInsert } from './features/teacher/course/course-insert/course-insert';
import { CourseGetall } from './features/teacher/course/course-getall/course-getall';
import { OverviewTeacher } from './features/teacher/overview-teacher/overview-teacher';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardRedirect } from './page/dashboard-sell/dashboard-redirect/dashboard-redirect';
import { RoleGuard } from './core/guards/role.guard';
import { CourseDetails } from './features/teacher/course/course-details/course-details';
import { LessonGetall } from './features/teacher/lesson/lesson-getall/lesson-getall';
import { Catalog } from './page/catalogs/catalog/catalog';
import { CourseDetail } from './page/catalogs/course-detail/course-detail';
import { MyCourses } from './features/student/course/my-courses/my-courses';
import { LearningCourse } from './features/student/course/learning-course/learning-course';
import { GuestGuard } from './core/guards/guest.guard';
import { TeacherEnrollments } from './features/teacher/student/teacher-enrollments/teacher-enrollments';
import { StudentProfile } from './features/student/profile/student-profile/student-profile';
import { AdminDashboardComponent } from './features/admin/dashboard/admin-dashboard/admin-dashboard';
import { AdminUsersComponent } from './features/admin/users/admin-users/admin-users';
import { AdminCoursesComponent } from './features/admin/courses/admin-courses/admin-courses';
import { AdminCategoriesComponent } from './features/admin/categories/admin-categories/admin-categories';
import { AdminEnrollmentsComponent } from './features/admin/enrollments/admin-enrollments/admin-enrollments';
import { NotFound } from './page/not-found/not-found';
import { Pricing } from './page/pricing/pricing';
import { Teachers } from './page/teachers/teachers';
import { TeacherProfile } from './features/teacher/profile/teacher-profile/teacher-profile';
import { StudentCertificates } from './features/student/certificates/student-certificates';
import { TeacherCertificates } from './features/teacher/certificates/teacher-certificates';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'about', component: About },
    { path: 'catalog', component: Catalog },
    { path: 'catalog/course/:id', component: CourseDetail },
    { path: 'precios', component: Pricing },
    { path: 'teachers', component: Teachers },
    {
        path: 'auth', component: AuthLayout, canActivate: [GuestGuard], children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: Login },
            { path: 'register', component: RegisterUser }
        ]
    },
    {
        path: 'dashboard', component: DashboardSell,
        canActivate: [AuthGuard], children: [
            { path: '', component: DashboardRedirect, canActivate: [AuthGuard] },
            { path: 'course-insert', component: CourseInsert, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'course-getall', component: CourseGetall, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'course-details/:id', component: CourseDetails, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'overview-teacher', component: OverviewTeacher, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'lesson-getall', component: LessonGetall, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'lesson-detail/:id', loadComponent: () => import('./features/teacher/lesson/lesson-detail/lesson-detail').then(c => c.LessonDetail), canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'students-enrollments', component: TeacherEnrollments, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'profile-teacher', component: TeacherProfile, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'teacher-certificates', component: TeacherCertificates, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },

            { path: 'learning/course/:idCourse', component: LearningCourse, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            { path: 'my-courses', component: MyCourses, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            { path: 'profile', component: StudentProfile, canActivate: [AuthGuard] },
            { path: 'student-certificates', component: StudentCertificates, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            // Admin routes
            { path: 'admin', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { roles: ['ROLE_ADMIN'] } },
            { path: 'admin/users', component: AdminUsersComponent, canActivate: [RoleGuard], data: { roles: ['ROLE_ADMIN'] } },
            { path: 'admin/courses', component: AdminCoursesComponent, canActivate: [RoleGuard], data: { roles: ['ROLE_ADMIN'] } },
            { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [RoleGuard], data: { roles: ['ROLE_ADMIN'] } },
            { path: 'admin/enrollments', component: AdminEnrollmentsComponent, canActivate: [RoleGuard], data: { roles: ['ROLE_ADMIN'] } }
        ]
    },
    { path: '**', component: NotFound }
];
