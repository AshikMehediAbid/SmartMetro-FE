import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';
import { KeycloakService } from '../../core/services/keycloak/keycloak-service';
import { ToastService } from '../../core/services/toast/toast-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  router = inject(Router);
  private _authService = inject(AuthService);
  private keycloakService = inject(KeycloakService);
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

    const profile = this._authService.getDisplayProfile();
    this.userName.set(profile?.name || profile?.email || 'Profile');
  }

  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onRegisterClick() {
    this.router.navigateByUrl('/register');
  }

  async onLogoutClick() {
    const finalizeLogout = () => {
      this._authService.clearStorage();
      this.isLogin.set(this._authService.isLoggedIn());
      this.userName.set('');
      this.router.navigate(['/login']);
    };

    try {
      if (this._authService.getAuthProvider() === 'keycloak') {
        await this.keycloakService.logout();
      }

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
    } catch (error) {
      this.toastService.error('Logout failed. Please try again.');
      finalizeLogout();
    }
  }

  onProfileClick() {
    this.router.navigate(['/user-profile']);
  }

  onDashboardClick(): void {
    this.router.navigate(['/dashboard']);
  }

  onBuyTicketClick(): void {
    this.router.navigate(['/ticket-purchase']);
  }

  onTicketsClick(): void {
    this.router.navigate(['/tickets']);
  }

  onFareClick(): void {
    this.router.navigate(['/distance&fare']);
  }
}
