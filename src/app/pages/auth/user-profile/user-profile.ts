import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
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
  private toastService = inject(ToastService);
  router = inject(Router);

  userInfo = signal<UserProfileModel | null>(null);
  toggleChangePasswordVisible = signal<boolean>(false);
  changePasswordObj = signal<ChangePasswordModel>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  ngOnInit() {
    this.getUserProfile();
  }

  getUserProfile() {
    const user = this._authService.getUserInfo();

    if (!user) {
      this.userInfo.set(null);
      return;
    }

    const profile: UserProfileModel = {
      name: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      phoneNumber: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'],
      role: user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    };

    this.userInfo.set(profile);
  }

  onHomeClick(){
    this.router.navigate(['/']);
  }

  onLogoutClick(){
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

  onChangePasswordClick(){
    this.toggleChangePasswordVisible.set(!this.toggleChangePasswordVisible());
  }

  onUpdatePasswordClick(){
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
