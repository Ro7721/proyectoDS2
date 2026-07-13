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
  ): boolean | UrlTree {

    const roles =
      route.data['roles'] as string[];

    if (!roles?.length) {
      return true;
    }

    const currentRole = this.authService.currentRole;
    if (currentRole && roles.includes(currentRole)) {
      return true;
    }
    switch (currentRole) {
      case "ROLE_STUDENT":
        return this.router.createUrlTree(["/dashboard/my-courses"]);
      case "ROLE_TEACHER":
        return this.router.createUrlTree(["/dashboard/overview-teacher"]);
      case "ROLE_ADMIN":
        return this.router.createUrlTree(["/dashboard/admin"]);
      default:
        return this.router.createUrlTree(['/auth/login']);
    }
  }
}
