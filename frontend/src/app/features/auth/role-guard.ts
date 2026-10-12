
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!user || !allowedRoles) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.includes(user.role)) {
    return true;
  }

  switch (user.role) {
    case 'ADMIN':
      return router.createUrlTree(['/admin']);

    case 'MANAGER':
      return router.createUrlTree(['/manager']);

    case 'USER':
      return router.createUrlTree(['/user']);

    default:
      authService.logout();
      return router.createUrlTree(['/login']);
  }
};
