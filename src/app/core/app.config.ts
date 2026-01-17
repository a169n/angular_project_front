import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { HttpClientXsrfModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { appRoutes } from './app.routes';
import { apiBaseUrlProvider } from './tokens';
import { errorInterceptor } from './interceptors/error.interceptor';
import { FeatureFlagService } from './services/feature-flag.service';
import { RouterModule } from '@angular/router';
import { PreloadAllModules } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    importProvidersFrom(
      RouterModule,
      HttpClientXsrfModule.withOptions({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
    apiBaseUrlProvider,
    FeatureFlagService,
  ],
};
