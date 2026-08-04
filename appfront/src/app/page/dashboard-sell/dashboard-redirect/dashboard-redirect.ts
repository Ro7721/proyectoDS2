import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-redirect',
  imports: [],
  template: ``,
})
export class DashboardRedirect implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.navigate(this.authService.getRoleHomeUrl());
  }
}
