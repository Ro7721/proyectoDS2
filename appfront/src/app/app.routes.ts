import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { Login } from './page/auth/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { RegisterUser } from './page/auth/register-user/register-user';
import { DashboardSell } from './page/dashboard-sell/dashboard-sell';
import { Learning } from './page/dashboard-sell/learning/learning';
import { CourseInsert } from './features/teacher/course/course-insert/course-insert';
import { CourseGetall } from './features/teacher/course/course-getall/course-getall';
import { OverviewTeacher } from './features/teacher/overview-teacher/overview-teacher';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardRedirect } from './page/dashboard-sell/dashboard-redirect/dashboard-redirect';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', component: Home },
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
            { path: 'learning', component: Learning, canActivate: [RoleGuard], data: { roles: ['ROLE_STUDENT'] } },
            { path: 'course-insert', component: CourseInsert, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'course-getall', component: CourseGetall, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } },
            { path: 'overview-teacher', component: OverviewTeacher, canActivate: [RoleGuard], data: { roles: ['ROLE_TEACHER'] } }
        ]
    }
];
