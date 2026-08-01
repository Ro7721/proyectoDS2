import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Promise<boolean | UrlTree> {
    if (!this.authService.isAuthenticated()) {
      if (!this.authService.refreshToken) {
        return this.redirectToLogin(state.url);
      }

      return this.resolveWithRefresh(route, state.url);
    }

    return this.resolveRoleAccess(route);
  }

  private async resolveWithRefresh(
    route: ActivatedRouteSnapshot,
    returnUrl: string
  ): Promise<boolean | UrlTree> {
    const authenticated = await this.authService.ensureAuthenticated();

    if (!authenticated) {
      return this.redirectToLogin(returnUrl);
    }

    return this.resolveRoleAccess(route);
  }

  private resolveRoleAccess(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles =
      route.data['roles'] as string[];

    if (!roles?.length) {
      return true;
    }

    const currentRole = this.authService.currentRole;
    if (currentRole && roles.includes(currentRole)) {
      return true;
    }
    return this.router.createUrlTree(this.authService.getRoleHomeUrl(currentRole));
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
