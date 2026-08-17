import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth-service';
import { KeycloakService } from '../services/keycloak/keycloak-service';

const refreshTokenPath = '/account/token';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const keycloakService = inject(KeycloakService);
  const isRefreshRequest =
    req.url.endsWith(refreshTokenPath) || req.url.includes(`${refreshTokenPath}?`);

  const attachToken = (token: string | null) => {
    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  if (isRefreshRequest) {
    return next(req);
  }

  if (authService.getAuthProvider() === 'keycloak') {
    const keycloakToken = keycloakService.getToken();

    if (!keycloakToken) {
      return next(req);
    }

    if (keycloakService.isTokenExpired()) {
      return from(keycloakService.refreshToken()).pipe(
        switchMap(() => next(attachToken(keycloakService.getToken() ?? keycloakToken))),
        catchError((error) => {
          authService.clearStorage();
          return throwError(() => error);
        }),
      );
    }

    return next(attachToken(keycloakToken));
  }

  const accessToken = authService.getAccessToken();

  if (!accessToken || !authService.isAccessTokenExpired(accessToken)) {
    return next(attachToken(accessToken));
  }

  return authService.getNewAccessToken().pipe(
    switchMap((response) => {
      const newToken = response.data?.accessToken;
      if (newToken) {
        authService.saveToken(newToken);
      }
      return next(attachToken(newToken ?? accessToken));
    }),
    catchError((error) => {
      authService.clearStorage();
      return throwError(() => error);
    }),
  );
};
