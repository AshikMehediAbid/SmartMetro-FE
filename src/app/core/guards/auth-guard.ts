import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUserInfo();
  const role = user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? user?.role ?? '';

  if (role === 'Admin') {
    return true;
  }

  return router.parseUrl('/not-found');
};
