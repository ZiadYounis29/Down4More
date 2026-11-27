import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { hasFetchResultGuard } from './features/playlist/guards/has-fetch-result.guard';
import { isSingleKindGuard } from './features/single/guards/is-single-kind.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'single',
    canActivate: [hasFetchResultGuard, isSingleKindGuard],
    loadComponent: () =>
      import('./features/single/single.component').then((m) => m.SingleComponent),
  },
  {
    path: 'playlist',
    loadChildren: () =>
      import('./features/playlist/playlist.routes').then((m) => m.PLAYLIST_ROUTES),
  },
  {
    path: 'downloads',
    loadComponent: () =>
      import('./features/downloads/downloads.component').then(
        (m) => m.DownloadsComponent,
      ),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/history.component').then(
        (m) => m.HistoryComponent,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  ...environment.devRoutes,
  { path: '**', redirectTo: '' },
];
