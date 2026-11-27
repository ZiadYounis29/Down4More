import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DownloadAction, DownloadRequest } from '@core/models';

@Injectable({ providedIn: 'root' })
export class DownloadService {
  private readonly api = inject(ApiService);

  start(requests: DownloadRequest[]): Observable<void> {
    return this.api.startDownloads(requests);
  }

  control(action: DownloadAction, ids: string[]): Observable<void> {
    return this.api.control(action, ids);
  }
}
