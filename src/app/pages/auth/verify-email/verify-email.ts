import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';

@Component({
  selector: 'app-verify-email',
  imports: [FormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  _authService = inject(AuthService);

  email = '';
  otp = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] ?? '';
      console.log(this.email);
    });
  }

  verifyOtp() {
    this._authService.verifyEmail(this.email, this.otp).subscribe({
      next: (response) => {
        alert(response.message);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert(error.error?.message ?? 'Verification failed.');
      },
    });
  }

  resendOtp() {
    console.log('Resend OTP');
    // Call your resend OTP API here
  }
}
