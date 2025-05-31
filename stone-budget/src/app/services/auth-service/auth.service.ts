import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../../types';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/v1';
  private readonly TOKEN_KEY = 'stone_budget_token';
  private readonly USER_KEY = 'stone_budget_user';

  // BehaviorSubject to track authentication state
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    // Check if token is still valid on service initialization
    this.validateStoredToken();
  }

  /**
   * Register a new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuthData(response.data.token, response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/logout`, {}).pipe(
      tap(() => this.clearAuthData()),
      catchError(() => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        return throwError(() => new Error('Logout completed locally'));
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.API_URL}/auth/profile`).pipe(
      tap(response => {
        if (response.success && response.data?.user) {
          this.currentUserSubject.next(response.data.user);
          this.saveUserToStorage(response.data.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verify token validity
   */
  verifyToken(): Observable<ApiResponse<{ user: User; tokenValid: boolean }>> {
    return this.http
      .get<ApiResponse<{ user: User; tokenValid: boolean }>>(`${this.API_URL}/auth/verify`)
      .pipe(
        tap(response => {
          if (response.success && response.data?.user) {
            this.currentUserSubject.next(response.data.user);
            this.isAuthenticatedSubject.next(true);
          } else {
            this.clearAuthData();
          }
        }),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has a specific role (for future use)
   */
  hasRole(role: string): boolean {
    // Placeholder for role-based access control
    // Your API doesn't currently have roles, but this is ready for future expansion
    return true;
  }

  /**
   * Private: Set authentication data
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Private: Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Private: Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Private: Save user to localStorage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Private: Check if token exists and appears valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token && token.length > 0;
  }

  /**
   * Private: Validate stored token with server
   */
  private validateStoredToken(): void {
    if (this.hasValidToken()) {
      this.verifyToken().subscribe({
        next: () => {
          // Token is valid, user data updated in tap operator
        },
        error: () => {
          // Token is invalid, clear auth data
          this.clearAuthData();
        },
      });
    }
  }

  /**
   * Private: Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific HTTP status codes
    switch (error.status) {
      case 401:
        this.clearAuthData();
        break;
      case 403:
        errorMessage = 'Access forbidden';
        break;
      case 404:
        errorMessage = 'Service not found';
        break;
      case 500:
        errorMessage = 'Server error, please try again later';
        break;
    }

    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
