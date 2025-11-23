import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER, inject, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpClient } from '@angular/common/http';
import { serverApiPrefixInterceptor } from './services/api.interceptor';
import { AuthService } from './auth/auth';
import { firstValueFrom, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// Custom Loader to avoid library version issues
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([serverApiPrefixInterceptor])),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })),
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
