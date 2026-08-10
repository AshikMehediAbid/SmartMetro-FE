import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiResponse, LoginModel, LoginResponse } from '../../../pages/auth/login/login';
import { ChangePasswordModel } from '../../../pages/auth/user-profile/user-profile';

@Service()
export class AuthService {
  http = inject(HttpClient);

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

  saveToken(token: string) {
    if (!token) {
      return;
    }

    localStorage.setItem('accessToken', token);

    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    const userInfo = JSON.parse(decodedPayload);

    localStorage.setItem('user', JSON.stringify(userInfo));
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
}
