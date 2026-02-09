import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  showOtpField = false;
  otpSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      otp: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.valid) {
      this.loading = true;

      if (this.showOtpField && this.otpSent) {
        this.completeRegistration();
      } else {
        this.sendOtp();
      }
    }
  }

  sendOtp(): void {
    const { email, username, password, firstName, lastName, contactNumber } = this.registerForm.value;

    this.authService.register({ username, email, password, firstName, lastName, contactNumber }).subscribe({
      next: () => {
        this.loading = false;
        this.showOtpField = true;
        this.otpSent = true;
        this.snackBar.open('OTP sent to your email', 'Close', { duration: 3000 });
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.message || 'Failed to send OTP';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  completeRegistration(): void {
    const { email, otp } = this.registerForm.value;

    if (!otp) {
      this.snackBar.open('Please enter the OTP sent to your email', 'Close', { duration: 3000 });
      return;
    }

    this.authService.verifyOtp(email, otp).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Verification successful! You are now logged in.', 'Close', { duration: 3000 });
        this.router.navigate(['/home']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const msg = err.error?.message || 'Verification failed. Invalid OTP.';
        this.snackBar.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}