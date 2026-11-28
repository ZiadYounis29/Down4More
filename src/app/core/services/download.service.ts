import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DownloadAction, DownloadRequest } from '@core/models';
import { ApiService } from './api.service';
import { NavigationService } from './navigation.service';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private readonly api = inject(ApiService);
  private readonly nav = inject(NavigationService);

  start(requests: DownloadRequest[]): Observable<void> {
    return this.api.startDownloads(requests).pipe(tap(() => this.nav.resetFlow()));
  }

  control(action: DownloadAction, ids: string[]): Observable<void> {
    return this.api.control(action, ids);
  }
}
