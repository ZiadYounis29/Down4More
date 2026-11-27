import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FetchInfoService } from '@core/services/fetch-info.service';

export const hasFetchResultGuard: CanActivateFn = () => {
  const result = inject(FetchInfoService).lastResult();
  return result && result.items.length > 0 ? true : inject(Router).parseUrl('/');
};
