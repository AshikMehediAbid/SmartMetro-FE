import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { KeycloakService } from '../../../core/services/keycloak/keycloak-service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast/toast-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile implements OnInit {
  private _authService = inject(AuthService);
  private keycloakService = inject(KeycloakService);
  private toastService = inject(ToastService);
  router = inject(Router);

  userInfo = signal<UserProfileModel | null>(null);
  isKeycloakUser = signal(false);
  toggleChangePasswordVisible = signal<boolean>(false);
  changePasswordObj = signal<ChangePasswordModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  ngOnInit() {
    this.isKeycloakUser.set(this._authService.getAuthProvider() === 'keycloak');
    this.getUserProfile();
  }

  getUserProfile() {
    this.userInfo.set(this._authService.getDisplayProfile());
  }

  onHomeClick() {
    this.router.navigate(['/']);
  }

  async onLogoutClick() {
    if (this.isKeycloakUser()) {
      try {
        await this.keycloakService.logout();
      } catch {
        this.toastService.error('Logout failed. Please try again.');
      }
      return;
    }

    const finalizeLogout = () => {
      this._authService.clearStorage();
      this.router.navigate(['/home']);
    };

    this._authService.userLogout().subscribe({
      next: (response) => {
        if (response?.message) {
          this.toastService.success(response.message);
        }
        finalizeLogout();
      },
      error: (error) => {
        this.toastService.error(error.error?.message ?? 'Logout failed. Please try again.');
        finalizeLogout();
      },
    });
  }

  onEditProfileClick() {
    if (this.isKeycloakUser()) {
      this.keycloakService.editProfile();
      return;
    }

    this.toastService.info('Edit profile is not available yet.');
  }

  onChangePasswordClick() {
    if (this.isKeycloakUser()) {
      this.keycloakService.changePassword();
      return;
    }

    this.toggleChangePasswordVisible.set(!this.toggleChangePasswordVisible());
  }

  onUpdatePasswordClick() {
    this._authService.changePassword(this.changePasswordObj()).subscribe({
      next: (response) => {
        this.toastService.success(response.message);
        this.toggleChangePasswordVisible.set(false);
        this.changePasswordObj.set({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
      error: (error) => {
        this.toastService.error(error.error?.message ?? 'Change password failed. Please try again.');
      },
    });
  }
}

export interface UserProfileModel {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export interface ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
