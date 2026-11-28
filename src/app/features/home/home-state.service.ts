import { effect, inject, Injectable, signal } from '@angular/core';
import { NavigationService } from '@core/services/navigation.service';
import { UrlEntry } from './url-entry.model';

@Injectable({ providedIn: 'root' })
export class HomeStateService {
  private readonly nav = inject(NavigationService);

  readonly links = signal<UrlEntry[]>([]);
  readonly draft = signal('');
  private nextId = 1;

  constructor() {
    effect(() => {
      if (this.nav.flowVersion() > 0) {
        this.links.set([]);
        this.draft.set('');
      }
    });
  }

  allocateId(): string {
    return `url-${this.nextId++}`;
  }
}
