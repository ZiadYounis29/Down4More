import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { MockApiService } from './core/services/mock-api.service';
import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    { provide: ApiService, useClass: MockApiService },
  ],
};
