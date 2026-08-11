import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth-service';
import { OtpVerificationType } from '../../../core/enums/OtpVerificationType';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  authService = inject(AuthService);
  router = inject(Router);

  registerObj = signal<RegisterModel>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  onRegisterClick() {
    this.authService.userRegister(this.registerObj()).subscribe({
      next: (response) => {
        this.router.navigate(['/login']
      );
      },
      error: (error) => {
        // Handle registration error
      },
    });
  }
}

export interface RegisterModel {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}
