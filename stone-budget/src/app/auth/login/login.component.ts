import { Component, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth-service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  public loginForm: FormGroup;
  public isLoading: boolean = false;
  public errorMessage: string = '';
  public showPassword: boolean = false;

  private onDestroy$ = new Subject<void>();

  public constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder
  ) {}

  public ngOnInit() {
    this.initializeForm();
  }

  public ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.performLogin();
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loginForm.valueChanges
      .pipe(
        takeUntil(this.onDestroy$),
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged() // Only emit if values actually changed
      )
      .subscribe(() => {
        if (this.errorMessage) {
          this.errorMessage = '';
        }
      });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Perform the login operation
   */
  private performLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService
      .login({ email: email.trim(), password })
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({
        next: response => {
          this.isLoading = false;

          if (response.success) {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

            // Properly handle fallback by returning the second navigate promise
            this.router.navigate([returnUrl]).catch(err => {
              console.error('Navigation error:', err);
              return this.router.navigate(['/dashboard']);
            });
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: error => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Login failed. Please try again.';
          console.error('Login error:', error);
        },
      });
  }

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Check if a specific field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Check if a specific field has a particular error
   */
  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.errors?.[errorType] && (field.dirty || field.touched));
  }

  /**
   * Get error message for a specific field
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Password must be at least ${requiredLength} characters`;
    }

    return 'Invalid input';
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      email: 'Email',
      password: 'Password',
    };
    return displayNames[fieldName] || fieldName;
  }

  /**
   * Handle keyboard events
   */
  onKeyDown(event: KeyboardEvent): void {
    // Submit form on Enter key
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }

  /**
   * Clear all form errors and reset form state
   */
  clearErrors(): void {
    this.errorMessage = '';
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
  }

  /**
   * Get form control for easy access in template
   */
  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  /**
   * Check if form is ready for submission
   */
  get canSubmit(): boolean {
    return this.loginForm.valid && !this.isLoading;
  }
}
