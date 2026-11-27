import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { PlaylistStateService } from '../services/playlist-state.service';

export const hasChosenGuard: CanActivateFn = () => {
  const router = inject(Router);
  const result = inject(FetchInfoService).lastResult();
  if (!result || result.items.length === 0) return router.parseUrl('/');
  return inject(PlaylistStateService).chosenIds().length > 0
    ? true
    : router.parseUrl('/playlist/select');
};
