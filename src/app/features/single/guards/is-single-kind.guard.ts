import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FetchInfoService } from '@core/services/fetch-info.service';

export const isSingleKindGuard: CanActivateFn = () => {
  const result = inject(FetchInfoService).lastResult();
  if (!result) return true;
  return result.kind === 'single' ? true : inject(Router).parseUrl('/');
};
