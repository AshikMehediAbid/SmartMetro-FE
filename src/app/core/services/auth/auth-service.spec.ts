import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should prefer the Keycloak token when the active provider is Keycloak', () => {
    localStorage.setItem('accessToken', 'app-token');
    localStorage.setItem('keycloakAccessToken', 'keycloak-token');
    localStorage.setItem('authProvider', 'keycloak');

    expect(service.getAccessToken()).toBe('keycloak-token');
  });

  it('should save a Keycloak token as the active provider', () => {
    service.saveToken('keycloak-token', 'keycloak');

    expect(localStorage.getItem('keycloakAccessToken')).toBe('keycloak-token');
    expect(localStorage.getItem('authProvider')).toBe('keycloak');
    expect(service.getAccessToken()).toBe('keycloak-token');
  });
});
