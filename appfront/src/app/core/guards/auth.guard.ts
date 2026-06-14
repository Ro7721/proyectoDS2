import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {

    const authenticated =
      await this.authService.ensureAuthenticated();

    if (authenticated) {
      return true;
    }

    return this.router.createUrlTree(
      ['/auth/login'],
      {
        queryParams: {
          returnUrl: state.url
        }
      }
    );
  }

}
