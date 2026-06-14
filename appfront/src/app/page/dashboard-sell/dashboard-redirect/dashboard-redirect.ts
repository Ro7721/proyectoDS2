import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-redirect',
  imports: [],
  template: ``,
})
export class DashboardRedirect implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {

    const role = this.authService.currentRole;

    switch (role) {

      case 'ROLE_TEACHER':
        this.router.navigate(['/dashboard/overview-teacher']);
        break;

      case 'ROLE_ADMIN':
        this.router.navigate(['/dashboard/admin']);
        break;

      case 'ROLE_STUDENT':
      default:
        this.router.navigate(['/dashboard/learning']);
        break;
    }
  }
}
