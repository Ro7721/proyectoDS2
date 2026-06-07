import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { Login } from './page/auth/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { RegisterUser } from './page/auth/register-user/register-user';
import { DashboardSell } from './page/dashboard-sell/dashboard-sell';
import { Learning } from './page/dashboard-sell/learning/learning';

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
            { path: 'learning', component: Learning }
        ]
    }
];
