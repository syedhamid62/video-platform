import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const isLoggedIn = !!localStorage.getItem('adminToken');

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/admin']);
  return false;
};