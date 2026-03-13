import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const roles = route.data['roles'] as string[] | undefined;

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (!roles || roles.length === 0) {
    return true;
  }

  if (roles.includes(auth.getRole())) {
    return true;
  }

  return router.createUrlTree(['/rooms']);
};
