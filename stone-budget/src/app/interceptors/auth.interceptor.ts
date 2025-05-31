import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service/auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP Interceptor to automatically add JWT token to requests
 * and handle authentication errors globally
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Get the auth token
  const authToken = authService.getToken();

  // Clone the request and add authorization header if token exists
  let authReq = req;
  if (authToken && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Add CORS headers for cross-origin requests
  if (req.url.includes('localhost:3000')) {
    authReq = authReq.clone({
      setHeaders: {
        ...authReq.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle authentication errors globally
      if (error.status === 401) {
        console.warn('Authentication failed - redirecting to login');
        // The AuthService will handle the logout and redirect
        authService.logout().subscribe();
      }

      // Handle other HTTP errors
      if (error.status === 0) {
        console.error('Network error - unable to connect to server');
      } else if (error.status >= 500) {
        console.error('Server error:', error.message);
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};
