import { Observable } from 'rxjs';
import {
  DownloadAction,
  DownloadItem,
  DownloadRequest,
  FetchResult,
} from '@core/models';

export abstract class ApiService {
  abstract fetchInfo(urls: string[]): Observable<FetchResult>;

  /**
   * Each request's settings are what the user ASKED for; the backend resolves them
   * per video (quality: nearest lower, else lowest above; bit-rate: nearest;
   * format: first valid) and returns the resolved settings in DownloadItem.settings.
   */
  abstract startDownloads(requests: DownloadRequest[]): Observable<void>;

  abstract downloads$(): Observable<DownloadItem[]>;
  abstract control(action: DownloadAction, ids: string[]): Observable<void>;
  abstract history(query?: string): Observable<DownloadItem[]>;
}
