import type { Routes } from '@angular/router';

export const environment = {
  production: false,
  devRoutes: [
    {
      path: 'dev',
      loadChildren: () => import('../app/dev/dev.routes').then((m) => m.DEV_ROUTES),
    },
  ] as Routes,
};
