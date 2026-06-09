import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { Login } from './page/auth/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { RegisterUser } from './page/auth/register-user/register-user';
import { DashboardSell } from './page/dashboard-sell/dashboard-sell';
import { Learning } from './page/dashboard-sell/learning/learning';
import { CourseInsert } from './features/teacher/course/course-insert/course-insert';
import { CourseGetall } from './features/teacher/course/course-getall/course-getall';

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
        path: 'dashboard', component: DashboardSell, children: [
            { path: '', redirectTo: 'learning', pathMatch: 'full' },
            { path: 'learning', component: Learning },
            { path: 'course-insert', component: CourseInsert },
            { path: 'course-getall', component: CourseGetall }
        ]
    }
];
