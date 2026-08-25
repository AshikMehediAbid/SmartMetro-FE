import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ApiResponse, LoginModel, LoginResponse } from '../../../pages/auth/login/login';
import { ChangePasswordModel } from '../../../pages/auth/user-profile/user-profile';
import { RegisterModel } from '../../../pages/auth/register/register';
import { OtpVerificationType } from '../../enums/OtpVerificationType';
import { OtpVerificationModel } from '../../../pages/verify-otp/verify-otp';
import { email } from '@angular/forms/signals';

export interface KeycloakUserSyncModel {
  email: string;
  name: string;
  keycloakUserId: string;
  roles: string[];
}

type AuthProvider = 'app' | 'keycloak';

@Service()
export class AuthService {
  http = inject(HttpClient);

  private readonly appTokenKey = 'accessToken';
  private readonly keycloakTokenKey = 'keycloakAccessToken';
  private readonly authProviderKey = 'authProvider';

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

    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/verify-otp',
      otpVerificationObj,
    );
  }
  getNewAccessToken() {
    return this.http.post<ApiResponse<{ accessToken: string }>>(
      'https://localhost:7246/api/account/token',
      {},
      { withCredentials: true },
    );
  }

  getAuthProvider(): AuthProvider {
    return localStorage.getItem(this.authProviderKey) === 'keycloak' ? 'keycloak' : 'app';
  }

  getAccessToken(): string | null {
    const provider = this.getAuthProvider();

    if (provider === 'keycloak') {
      return localStorage.getItem(this.keycloakTokenKey);
    }

    return localStorage.getItem(this.appTokenKey);
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

  saveToken(token: string, provider: AuthProvider = 'app') {
    if (!token) {
      return;
    }

    const activeProvider = provider === 'keycloak' ? 'keycloak' : 'app';

    if (activeProvider === 'keycloak') {
      localStorage.setItem(this.keycloakTokenKey, token);
      localStorage.setItem(this.authProviderKey, 'keycloak');
    } else {
      localStorage.setItem(this.appTokenKey, token);
      localStorage.setItem(this.authProviderKey, 'app');
    }

    const payload = token.split('.')[1] ?? '';

    try {
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const userInfo = JSON.parse(decodedPayload);
      localStorage.setItem('user', JSON.stringify(userInfo));
    } catch {
      localStorage.removeItem('user');
    }
  }

  clearStorage() {
    localStorage.removeItem(this.appTokenKey);
    localStorage.removeItem(this.keycloakTokenKey);
    localStorage.removeItem(this.authProviderKey);
    localStorage.removeItem('user');
    localStorage.removeItem('keycloak-user-sync');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUserInfo() {
    const userInfoString = localStorage.getItem('user');
    if (!userInfoString) {
      return null;
    }

    const userInfo = JSON.parse(userInfoString);
    return userInfo;
  }

  getUserEmail(): string  {
    const user = this.getUserInfo();

    if (!user)
      return '';

    return user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? user.email ?? '';
  }
  getDisplayProfile(): { name: string; email: string; phoneNumber: string; role: string } | null {
    const user = this.getUserInfo();

    if (!user) {
      return null;
    }

    const role = this.formatRoles(this.getUserRoles());

    if (this.getAuthProvider() === 'keycloak') {
      return {
        name: user.name ?? user.preferred_username ?? '',
        email: user.email ?? '',
        phoneNumber: user.phone_number ?? '',
        role,
      };
    }

    return {
      name: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? '',
      email: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? '',
      phoneNumber: user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone'] ?? '',
      role: user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? role,
    };
  }

  private formatRoles(roles: string[]): string {
    const filtered = roles.filter(
      (role) =>
        role !== 'offline_access' &&
        role !== 'uma_authorization' &&
        !role.startsWith('default-roles-'),
    );

    return (filtered.length ? filtered : roles).join(', ');
  }

  getUserRoles(): string[] {
    const user = this.getUserInfo();

    const roleSource =
      user?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      user?.role ??
      user?.realm_access?.roles ??
      user?.resource_access?.account?.roles ??
      [];

    if (Array.isArray(roleSource)) {
      return roleSource.map((role) => String(role));
    }

    return roleSource ? [String(roleSource)] : [];
  }

  isAdmin(): boolean {
    return this.getUserRoles().some((role) => role.toLowerCase() === 'admin');
  }

  syncKeycloakUserProfile(userProfile: KeycloakUserSyncModel, accessToken?: string) {
    const token = accessToken ?? this.getAccessToken();

    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/keycloak-user',
      userProfile,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      },
    );
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
    return this.http.post<ApiResponse<any>>(
      'https://localhost:7246/api/account/resend-otp',
      reqObj,
    );
  }
}
