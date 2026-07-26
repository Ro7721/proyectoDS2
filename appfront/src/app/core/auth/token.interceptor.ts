import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { MessageToast } from '../../message/message-toast';

let refreshRequest: Promise<string | null> | null = null;

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const toastMessage = inject(MessageToast);
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => request.url.includes(path));
  const accessToken = authService.accessToken;

  const authRequest = !isPublicAuthRequest && accessToken
    ? addBearerToken(request, accessToken, authService.getTokenType())
    : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        toastMessage.toastError('Acceso denegado', 'Su sesión expiró o no tiene permisos.');
        authService.logout();
        return throwError(() => error);
      }

      if (error.status === 401 && !isPublicAuthRequest && !authService.refreshToken) {
        toastMessage.toastWarn('Sesión Expirada', 'Su sesión ha expirado, por favor ingrese nuevamente');
        authService.logout();
        return throwError(() => error);
      }

      if (error.status !== 401 || isPublicAuthRequest || !authService.refreshToken) {
        return throwError(() => error);
      }

      refreshRequest ??= authService
        .refreshAccessToken()
        .then((response) => response?.accessToken ?? null)
        .finally(() => {
          refreshRequest = null;
        });

      return from(refreshRequest).pipe(
        switchMap((newToken) => {
          if (!newToken) {
            authService.logout();
            toastMessage.toastWarn('Sesión Expirada', 'Su sesión ha expirado, por favor ingrese nuevamente');
            return throwError(() => error);
          }

          return next(addBearerToken(request, newToken, authService.getTokenType()));
        }),
        catchError((refreshError) => {
          authService.logout();
          toastMessage.toastWarn('Sesión Expirada', 'Su sesión ha expirado, por favor ingrese nuevamente');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function addBearerToken(request: HttpRequest<unknown>, token: string, tokenType: string) {
  return request.clone({
    setHeaders: {
      Authorization: `${tokenType} ${token}`,
    },
  });
}
