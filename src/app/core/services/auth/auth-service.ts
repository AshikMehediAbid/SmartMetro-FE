import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiResponse, LoginModel, LoginResponse } from '../../../pages/auth/login/login';
import { ChangePasswordModel } from '../../../pages/auth/user-profile/user-profile';
import { RegisterModel } from '../../../pages/auth/register/register';
import { OtpVerificationType } from '../../enums/OtpVerificationType';
import { OtpVerificationModel } from '../../../pages/verify-otp/verify-otp';

@Service()
export class AuthService {
  http = inject(HttpClient);

  userRegister(registerObject: RegisterModel) {
    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/register',
      registerObject,
      { withCredentials: true },
    );
  }

  userLogin(loginObject: LoginModel) {
    return this.http.post<ApiResponse<LoginResponse>>(
      'https://localhost:7246/api/account/login',
      loginObject,
      { withCredentials: true },
    );
  }

  userLogout() {
    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/logout',
      {},
      { withCredentials: true },
    );
  }

  changePassword(changePasswordObj: ChangePasswordModel) {
    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/change-password',
      changePasswordObj,
      { withCredentials: true },
    );
  }

  verifyEmail(email: string, otp: string) {
    //const params = new HttpParams()
    //.set('email', email)
    //.set('otp', otp);
    return this.http.get<ApiResponse<any>>('https://localhost:7246/api/account/verifyemail', {
      params: {
        email,
        otp,
      },
    });
  }

  verifyOTP(otpVerificationObj: OtpVerificationModel) {
    //const params = new HttpParams()
    //.set('email', email)
    //.set('otp', otp);
    debugger;
    return this.http.post<ApiResponse<any>>('https://localhost:7246/api/account/verify-otp', otpVerificationObj);
  }
  getNewAccessToken() {
    return this.http.post<ApiResponse<{ accessToken: string }>>(
      'https://localhost:7246/api/account/token',
      {},
      { withCredentials: true },
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getTokenPayload(token: string | null) {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  isAccessTokenExpired(token?: string): boolean {
    const accessToken = token ?? this.getAccessToken();
    const payload = this.getTokenPayload(accessToken);

    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  }

  saveToken(token: string) {
    if (!token) {
      return;
    }

    localStorage.setItem('accessToken', token);

    const payload = token.split('.')[1] ?? '';

    debugger;
    try {
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const userInfo = JSON.parse(decodedPayload);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch {
      localStorage.removeItem('user');
    }
  }

  clearStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUserInfo() {
    const userInfoString = localStorage.getItem('user');
    if (!userInfoString) {
      return null;
    }

    const userInfo = JSON.parse(userInfoString);
    return userInfo;
  }

  getUserProfile(email: string) {
    return this.http.get<ApiResponse<any>>('https://localhost:7246/api/account/user-profile', {
      params: { email },
    });
  }

  recoverPassword(email: string) {
    return this.http.get<ApiResponse<any>>('https://localhost:7246/api/account/recover-password', {
      params: { email },
    });
  }

  resendOtp(reqObj: OtpVerificationModel) {
    debugger;
    return this.http.post<ApiResponse<any>>('https://localhost:7246/api/account/resend-otp',reqObj);
  }
}
