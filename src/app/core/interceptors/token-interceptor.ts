import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth-service';

const refreshTokenPath = '/account/token';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  const isRefreshRequest = req.url.endsWith(refreshTokenPath) || req.url.includes(`${refreshTokenPath}?`);

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
