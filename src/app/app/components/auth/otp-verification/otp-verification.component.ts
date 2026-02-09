import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
  otpForm: FormGroup;
  loading = false;
  countdown = 60;
  canResend = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });
  }

  ngOnInit(): void {
    // Get email from route params or previous step
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });

    // Start countdown timer
    this.startCountdown();
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.canResend = true;
      }
    }, 1000);
  }

  onDigitChange(index: number): void {
    if (index < 6) {
      const nextElement = document.getElementById(`digit${index + 1}`);
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  onDigitKeyDown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && index > 1) {
      const prevElement = document.getElementById(`digit${index - 1}`);
      if (prevElement) {
        prevElement.focus();
      }
    }
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.loading = true;
      const otpCode = Object.values(this.otpForm.value).join('');
      
      // In a real app, you would verify the OTP with your backend
      // For this example, we'll simulate successful verification
      
      setTimeout(() => {
        this.loading = false;
        this.snackBar.open('OTP verified successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/home']);
      }, 1000);
    }
  }

  resendOtp(): void {
    if (this.canResend) {
      // Resend OTP logic would go here
      this.countdown = 60;
      this.canResend = false;
      this.startCountdown();
      
      this.snackBar.open('New OTP sent to your email', 'Close', { duration: 3000 });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}