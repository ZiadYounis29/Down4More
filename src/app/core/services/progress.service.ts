import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { auditTime } from 'rxjs';
import { ApiService } from './api.service';
import { DownloadItem } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = inject(ApiService);

  /** Every download the backend knows about for this session, newest state. */
  readonly items: Signal<DownloadItem[]> = toSignal(this.api.downloads$().pipe(auditTime(250)), {
    initialValue: [],
  });
}
