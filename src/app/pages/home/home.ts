import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  router = inject(Router);
  private _authService = inject(AuthService);
  isLogin: boolean = false;

  ngOnInit(){
    this.isLoggedIn();
  }
  isLoggedIn(): boolean {
    this.isLogin =  this._authService.isLoggedIn();
    return this.isLogin;
  }
  onLoginClick() {
    this.router.navigate(['/login']);
  }

  onRegisterClick() {
    this.router.navigateByUrl('/register');
  }

  onLogoutClick() {
    this._authService.userLogout().subscribe({
      next: (response) => {
        alert(response.message);
        this._authService.clearStorage();
        debugger;
        this.isLogin = false;
        this.router.navigate(['home']);
      },
      error: (error) => {
        alert(error.error?.message ?? 'Logout failed. Please try again.');
      },
    });
  }
}
