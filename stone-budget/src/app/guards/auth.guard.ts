import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth-service/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Auth guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        // Store the attempted URL for redirecting after login
        const returnUrl = state.url;
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl },
          replaceUrl: true,
        });
        return false;
      }
    })
  );
};

/**
 * Guard to prevent authenticated users from accessing auth pages (login/register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      } else {
        // User is already authenticated, redirect to dashboard
        router.navigate(['/dashboard'], { replaceUrl: true });
        return false;
      }
    })
  );
};

/**
 * Guard for role-based access (future expansion)
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url },
            replaceUrl: true,
          });
          return false;
        }

        // Check if user has required role
        if (authService.hasRole(requiredRole)) {
          return true;
        } else {
          // User doesn't have required role, redirect to dashboard
          router.navigate(['/dashboard'], { replaceUrl: true });
          return false;
        }
      })
    );
  };
};
