import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth-service';
import { Router } from '@angular/router';
import { OtpVerificationType } from '../../../core/enums/OtpVerificationType';
import { KeycloakService } from '../../../core/services/keycloak/keycloak-service';
import { ToastService } from '../../../core/services/toast/toast-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginObj: LoginModel = new LoginModel();
  _authService = inject(AuthService);
  router = inject(Router);
  keycloakService = inject(KeycloakService);
  private toastService = inject(ToastService);

  isLoading = false;
  errorMessage = '';

  onLogin() {
    const phoneNumber = this.loginObj.phoneNumber?.trim();
    const password = this.loginObj.password?.trim();

    if (!phoneNumber || !password) {
      const message = !phoneNumber && !password ? 'Phone number and password are required.' : !phoneNumber ? 'Phone number is required.' : 'Password is required.';
      this.errorMessage = message;
      this.toastService.error(message);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._authService.userLogin(this.loginObj).subscribe({
      next: (response: ApiResponse<LoginResponse>) => {
        this.isLoading = false;

        const loginData = response.data;

        // Email Not Verified
        if (!loginData.isEmailVerified && loginData.isEmailSent) {
          this.router.navigate(['/verify-otp'], {
            queryParams: {
              email: loginData.accessToken,
              type: OtpVerificationType.EMAIL_VERIFICATION,
            },
          });
          return;
        }

        // Login successful
        alert(response.message);

        // Save access token
        if (loginData.isEmailVerified) {
          this._authService.saveToken(loginData.accessToken);
        }

        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;

        const message = error.error?.message ?? 'Login failed. Please try again.';
        this.errorMessage = message;
        this.toastService.error(message);
      },
    });
  }

  onRegisterClick() {
    this.router.navigate(['/register']);
  }

  onRecoveryPasswordClick() {
    this.router.navigate(['/recover-password']);
  }

  async onKeycloakLogin() {
    await this.keycloakService.login();
  }
}

export class LoginModel {
  phoneNumber: string;
  password: string;
  rememberMe: boolean = false;

  constructor() {
    this.phoneNumber = '';
    this.password = '';
  }
}

export interface LoginResponse {
  accessToken: string;
  isEmailVerified: boolean;
  isEmailSent: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
