import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    // Already logged in? Send them to the dashboard
    router.navigate(['/rooms']);
    return false;
  }

  // Not logged in? Perfect, let them see the login page
  return true;
};