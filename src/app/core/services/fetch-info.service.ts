import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { FetchResult } from '@core/models';

@Injectable({ providedIn: 'root' })
export class FetchInfoService {
  private readonly api = inject(ApiService);

  readonly lastResult = signal<FetchResult | null>(null);

  load(urls: string[]): Observable<FetchResult> {
    return this.api.fetchInfo(urls).pipe(tap((result) => this.lastResult.set(result)));
  }
}
