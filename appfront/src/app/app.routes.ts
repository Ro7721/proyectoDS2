import { Routes } from '@angular/router';
import { Home } from './page/home/home';
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
import { LessonGetall } from './features/teacher/lesson/lesson-getall/lesson-getall';
import { Catalog } from './page/catalogs/catalog/catalog';
import { CourseDetail } from './page/catalogs/course-detail/course-detail';
import { MyCourses } from './features/student/course/my-courses/my-courses';
import { LearningEstudent } from './features/student/learning-estudent/learning-estudent';
import { LearningCourse } from './features/student/course/learning-course/learning-course';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'catalog', component: Catalog },
    { path: 'catalog/course/:id', component: CourseDetail },
    {
        path: 'auth', component: AuthLayout, children: [
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
            { path: 'overview-teacher', component: OverviewTeacher, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'lesson-getall', component: LessonGetall, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },

            { path: 'learning-estudent', component: LearningEstudent, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            { path: 'learning/course/:idCourse', component: LearningCourse, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            { path: 'my-courses', component: MyCourses, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } }
        ]
    }
];
