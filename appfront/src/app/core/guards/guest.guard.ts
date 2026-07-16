import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree | Promise<boolean | UrlTree> {
    if (this.authService.isAuthenticated()) {
      return this.router.createUrlTree(this.authService.getRoleHomeUrl());
    }

    if (!this.authService.refreshToken) {
      return true;
    }

    return this.resolveWithRefresh();
  }

  private async resolveWithRefresh(): Promise<boolean | UrlTree> {
    const authenticated = await this.authService.ensureAuthenticated();

    if (!authenticated) {
      return true;
    }

    return this.router.createUrlTree(this.authService.getRoleHomeUrl());
  }
}
