import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';
import { OtpVerificationType } from '../../core/enums/OtpVerificationType';

@Component({
  selector: 'app-verify-otp',
  imports: [FormsModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
})
export class VerifyOtp {
  email = signal<string>('');
  otp = signal<string>('');
  resendOtpSuccessful = signal<boolean | null>(null);
  verificationType: string = '';

  route = inject(ActivatedRoute);
  router = inject(Router);

  _authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email.set(params['email'] ?? '');
      this.verificationType = params['type'] ?? '';

      console.log(this.email(), this.verificationType);
    });
  }

  get verification(): string {
    switch (this.verificationType) {
      case OtpVerificationType.PASSWORD_RECOVERY:
        return 'recover your password';

      case OtpVerificationType.PASSWORD_RESET:
        return 'verify your account';

      case OtpVerificationType.EMAIL_VERIFICATION:
        return 'verify your Email';

      default:
        return 'complete the verification';
    }
  }

  verifyOtp() {
    const otpVerificationObj: OtpVerificationModel = {
      email: this.email(),
      otp: this.otp(),
      type: this.verificationType,
    };

    this._authService.verifyOTP(otpVerificationObj).subscribe({
      next: (response) => {
        alert(response.message);
        this.afterSuccessfulVerificationNavigateTo();
      },
      error: (error) => {
        alert(error.error?.message ?? 'Verification failed.');
      },
    });
  }

  afterSuccessfulVerificationNavigateTo() {
    switch (this.verificationType) {
      case 'password_recovery':
        return 'reset your password';

      case 'EMAIL_VERIFICATION':
        return this.router.navigate(['/login']);

      default:
        return 'complete the verification';
    }
  }

  resendOtp() {
    const otpVerificationObj: OtpVerificationModel = {
      email: this.email(),
      otp: '',
      type: OtpVerificationType.EMAIL_VERIFICATION,
    };
    
debugger;
    this._authService.resendOtp(otpVerificationObj).subscribe({
      next: () => {
        this.resendOtpSuccessful.set(true);
      },
      error: (error) => {
        console.error('Failed to send OTP:', error);
      },
    });
  }
}

export interface OtpVerificationModel {
  email: string;
  otp: string;
  type: string;
}
