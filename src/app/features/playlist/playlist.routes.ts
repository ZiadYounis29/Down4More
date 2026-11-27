import { Routes } from '@angular/router';
import { hasFetchResultGuard } from './guards/has-fetch-result.guard';
import { hasChosenGuard } from './guards/has-chosen.guard';

export const PLAYLIST_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'select' },
  {
    path: 'select',
    canActivate: [hasFetchResultGuard],
    loadComponent: () =>
      import('./select/playlist-select.component').then(
        (m) => m.PlaylistSelectComponent,
      ),
  },
  {
    path: 'options',
    canActivate: [hasFetchResultGuard, hasChosenGuard],
    loadComponent: () =>
      import('./options/playlist-options.component').then(
        (m) => m.PlaylistOptionsComponent,
      ),
  },
];
