import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/interceptors/token-interceptor';
import { KeycloakService } from './core/services/keycloak/keycloak-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),

    provideAppInitializer(() => {
      const keycloakService = inject(KeycloakService);

      return keycloakService.init();
    }),
  ],
};
