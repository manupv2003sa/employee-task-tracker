
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const code = error.error?.code;

      if (
        error.status === 403 &&
        (code === 'ROLE_CHANGED' ||
          code === 'ACCOUNT_DEACTIVATED')
      ) {
        authService.logout();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
