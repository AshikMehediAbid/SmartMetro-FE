import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Router } from '@angular/router';
import { OtpVerificationType } from '../../../core/enums/OtpVerificationType';
import { single } from 'rxjs';
import { OtpVerificationModel } from '../../verify-otp/verify-otp';

@Component({
  selector: 'app-recover-password',
  imports: [FormsModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword {
  private authService = inject(AuthService);
  emailObj = signal<string>('');
  router = inject(Router);
  accountStatus = signal<AccountStatus>(null);
  isLoading = signal<boolean>(false);

  onAccountSearch() {
    this.accountStatus.set(null);
    this.isLoading.set(true);

    this.authService.recoverPassword(this.emailObj()).subscribe({
      next: (response) => {
        console.log('User profile:', response.data);

        // Account exists and email is verified
        this.accountStatus.set('verified');
        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('Error fetching user profile:', error.message);

        if (error.status === 404) {
          // Account does not exist
          this.accountStatus.set('not-found');
        } else if (error.status === 400) {
          // Account exists, but email is not verified
          this.accountStatus.set('not-verified');
        } else {
          // Unexpected error
          this.accountStatus.set(null);
        }
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  moveOtpVerificetionPage() {
    this.router.navigate(['/verify-otp'], {
      queryParams: { email: this.emailObj(), type: OtpVerificationType.PASSWORD_RECOVERY },
    });
  }

  sendEmailVerificationOtp() {
    const otpVerificationObj: OtpVerificationModel = {
      email: this.emailObj(),
      otp: '',
      type: OtpVerificationType.EMAIL_VERIFICATION,
    };

    this.authService.resendOtp(otpVerificationObj).subscribe({
      next: () => {
        this.router.navigate(['/verify-email'], {
          queryParams: { email: this.emailObj() },
        });
      },
      error: (error) => {
        console.error('Failed to send OTP:', error);
      },
    });

    this.router.navigate(['/email-verification'], {
      queryParams: { email: this.emailObj() },
    });
  }
}

type AccountStatus = 'not-found' | 'not-verified' | 'verified' | null;
