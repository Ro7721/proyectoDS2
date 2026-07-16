import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Promise<boolean | UrlTree> {

    if (this.authService.isAuthenticated()) {
      return true;
    }

    if (!this.authService.refreshToken) {
      return this.redirectToLogin(state.url);
    }

    return this.resolveWithRefresh(state.url);
  }

  private async resolveWithRefresh(returnUrl: string): Promise<boolean | UrlTree> {
    const authenticated = await this.authService.ensureAuthenticated();

    if (authenticated) {
      return true;
    }

    return this.redirectToLogin(returnUrl);
  }

  private redirectToLogin(returnUrl: string): UrlTree {
    return this.router.createUrlTree(
      ['/auth/login'],
      {
        queryParams: {
          returnUrl
        }
      }
    );
  }

}
