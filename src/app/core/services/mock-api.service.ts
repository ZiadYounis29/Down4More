// STUB owned by P4: overwrite completely.
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import {
  DownloadAction,
  DownloadItem,
  DownloadRequest,
  FetchResult,
} from '@core/models';
import { ApiService } from '@core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MockApiService extends ApiService {
  fetchInfo(_urls: string[]): Observable<FetchResult> {
    return EMPTY;
  }

  startDownloads(_requests: DownloadRequest[]): Observable<void> {
    return EMPTY;
  }

  downloads$(): Observable<DownloadItem[]> {
    return EMPTY;
  }

  control(_action: DownloadAction, _ids: string[]): Observable<void> {
    return EMPTY;
  }

  history(_query?: string): Observable<DownloadItem[]> {
    return of([]);
  }
}
