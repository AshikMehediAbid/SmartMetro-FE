import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';
import { ToastService } from '../../core/services/toast/toast-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  router = inject(Router);
  private _authService = inject(AuthService);
  private toastService = inject(ToastService);
  isLogin = signal<boolean>(false);
  userName = signal<string>('');

  ngOnInit() {
    this.loadUserName();
  }

  private loadUserName(): void {
    const loggedIn = this._authService.isLoggedIn();
    this.isLogin.set(loggedIn);

    if (!loggedIn) {
      this.userName.set('');
      return;
    }

    const userInfo = this._authService.getUserInfo();
    this.userName.set(userInfo?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? 'Profile');
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onRegisterClick() {
    this.router.navigateByUrl('/register');
  }

  onLogoutClick() {
    const finalizeLogout = () => {
      this._authService.clearStorage();
      this.isLogin.set(this._authService.isLoggedIn());
      this.userName.set('');
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

  onProfileClick() {
    this.router.navigate(['/user-profile']);
  }
}
