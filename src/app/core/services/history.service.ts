import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DownloadItem, HistoryEntry } from '@core/models';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly api = inject(ApiService);
  private readonly _items = signal<HistoryEntry[]>([]);

  readonly items = this._items.asReadonly();
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');

  /** One-shot load. api.history() must complete after emitting. */
  load(): void {
    this.status.set('loading');
    this.api.history().subscribe({
      next: (list) => {
        this._items.set(list as HistoryEntry[]);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }

  /** Call after a Retry or Remove succeeded: the entry leaves the list. */
  drop(id: string): void {
    this._items.update((list) => list.filter((item) => item.id !== id));
  }
}
