import { inject, Service } from '@angular/core';
import Keycloak from 'keycloak-js';
import { AuthService, KeycloakUserSyncModel } from '../auth/auth-service';

@Service()
export class KeycloakService {
  private readonly authService = inject(AuthService);
  private readonly logoutFlagKey = 'keycloak-logout-requested';
  private readonly keycloakUserSyncKey = 'keycloak-user-sync';

  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'smart-metro',
    clientId: 'smartmetro-fe',
  });

  private initialized = false;
  private isKeycloakUserSyncInProgress = false;

  private syncTokenToStorage(): void {
    const token = this.keycloak.token;
    if (!token) {
      return;
    }

    this.authService.saveToken(token, 'keycloak');
  }

  private syncKeycloakUserToBackend(): void {
    const token = this.keycloak.token;
    const userProfile = this.keycloak.tokenParsed ?? {};
    const keycloakUserId = this.keycloak.subject ?? userProfile['sub'];

    if (!token || !keycloakUserId) {
      return;
    }

    const syncedUserId = localStorage.getItem(this.keycloakUserSyncKey);
    if (syncedUserId === keycloakUserId || this.isKeycloakUserSyncInProgress) {
      return;
    }

    this.isKeycloakUserSyncInProgress = true;
    localStorage.setItem(this.keycloakUserSyncKey, keycloakUserId);

    const payload: KeycloakUserSyncModel = {
      keycloakUserId,
      email: userProfile['email'] ?? '',
      name: userProfile['name'] ?? userProfile['preferred_username'] ?? '',
      roles: userProfile['realm_access']?.['roles'] ?? userProfile['resource_access']?.['account']?.['roles'] ?? [],
    };

    this.authService.syncKeycloakUserProfile(payload, token).subscribe({
      next: (response) => {
        this.isKeycloakUserSyncInProgress = false;
        console.log('Keycloak user synced to backend:', response?.message ?? 'success');
      },
      error: (error) => {
        this.isKeycloakUserSyncInProgress = false;
        localStorage.removeItem(this.keycloakUserSyncKey);
        console.error('Could not sync Keycloak user to backend:', error);
      },
    });
  }

  async init(): Promise<boolean> {
    if (this.initialized) {
      return this.keycloak.authenticated ?? false;
    }

    if (localStorage.getItem(this.logoutFlagKey) === 'true') {
      localStorage.removeItem(this.logoutFlagKey);
      this.authService.clearStorage();
      this.keycloak.clearToken();
      this.keycloak.authenticated = false;
      this.initialized = true;
      return false;
    }

    this.keycloak.onAuthSuccess = () => {
      this.syncTokenToStorage();
      this.syncKeycloakUserToBackend();
    };
    this.keycloak.onAuthRefreshSuccess = () => this.syncTokenToStorage();
    this.keycloak.onAuthLogout = () => this.authService.clearStorage();

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoFallback: false,
      });

      this.initialized = true;

      if (authenticated && this.keycloak.token) {
        this.syncTokenToStorage();
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed', error);
      return false;
    }
  }

  async login(): Promise<void> {
    localStorage.removeItem(this.logoutFlagKey);

    await this.keycloak.login({
      redirectUri: window.location.origin + '/home',
    });
  }

  async logout(): Promise<void> {
    localStorage.setItem(this.logoutFlagKey, 'true');
    this.authService.clearStorage();
    this.keycloak.clearToken();
    this.keycloak.authenticated = false;

    await this.keycloak.logout({
      redirectUri: window.location.origin + '/home',
    });
  }

  isLoggedIn(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  isTokenExpired(): boolean {
    return this.keycloak.isTokenExpired();
  }

  getUserId(): string | undefined {
    return this.keycloak.subject;
  }

  getUserProfile(): any {
    return this.keycloak.tokenParsed;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshed = await this.keycloak.updateToken(30);

      if (refreshed && this.keycloak.token) {
        this.syncTokenToStorage();
      }

      return true;
    } catch (error) {
      console.error('Could not refresh Keycloak token', error);
      return false;
    }
  }

  editProfile() {
    return this.keycloak.accountManagement();
  }

  changePassword() {
    return this.keycloak.login({
      action: 'UPDATE_PASSWORD',
      redirectUri: window.location.origin + '/user-profile',
    });
  }
}
