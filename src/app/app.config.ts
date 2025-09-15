import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient,withFetch, withInterceptors } from '@angular/common/http';
import { serverApiPrefixInterceptor } from './services/api.interceptor';
import { AuthService } from './auth/auth';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),provideHttpClient(withFetch(), withInterceptors([serverApiPrefixInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthService);
        return () => {
          const user = auth.getUser();
          if (user) {
            return Promise.resolve();
          }
          return firstValueFrom(auth.fetchUser().pipe(take(1))).then(() => undefined).catch(() => undefined);
        };
      }
    }

  ]
};
