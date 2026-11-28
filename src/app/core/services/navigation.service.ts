import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FetchInfoService } from './fetch-info.service';

const FLOW_ROUTES = ['/', '/single', '/playlist/select', '/playlist/options'];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly fetchInfo = inject(FetchInfoService);

  private readonly history = signal<string[]>([]);
  private readonly lastFlowUrl = signal<string>('/');
  private readonly currentUrl = signal<string>('/');

  readonly showBack = computed(() => this.currentUrl() !== '/');
  readonly flowVersion = signal(0);
  private pendingClear = false;

  constructor() {
    this.record(this.router.url || '/');
    this.router.events
      ?.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.record(e.urlAfterRedirects || '/'));
  }

  /** Navigate back to the previous step in the download-setup flow, or fallback. */
  back(fallback = '/'): void {
    if (!FLOW_ROUTES.includes(this.cleanUrl(this.router.url))) {
      this.returnToFlow();
      return;
    }
    const stack = this.history();
    if (stack.length > 1) {
      const target = stack[stack.length - 2];
      // Trim current entry before navigating so Back doesn't ping-pong
      this.history.set(stack.slice(0, -2));
      this.router.navigateByUrl(target);
      return;
    }
    this.router.navigateByUrl(fallback);
  }

  /** Return to the most recent download-setup flow step (or '/' if none). */
  returnToFlow(): void {
    const target = this.lastFlowUrl();
    if (target !== '/' && !this.fetchInfo.lastResult()) {
      this.router.navigateByUrl('/');
      return;
    }
    this.router.navigateByUrl(target);
  }

  /** Flush flow history and fetch state after starting a download. */
  resetFlow(): void {
    this.history.set(['/']);
    this.lastFlowUrl.set('/');
    this.flowVersion.update((v) => v + 1);
    if (FLOW_ROUTES.includes(this.currentUrl())) {
      this.pendingClear = true;
    } else {
      this.pendingClear = false;
      this.fetchInfo.clear();
    }
  }

  private cleanUrl(url: string): string {
    return url.split('?')[0].split('#')[0] || '/';
  }

  private record(url: string): void {
    const clean = this.cleanUrl(url);
    this.currentUrl.set(clean);
    if (this.pendingClear && !FLOW_ROUTES.includes(clean)) {
      this.pendingClear = false;
      this.fetchInfo.clear();
    }
    if (FLOW_ROUTES.includes(clean)) {
      this.lastFlowUrl.set(clean);
      this.history.update((stack) => {
        if (stack[stack.length - 1] === clean) return stack;
        return [...stack, clean];
      });
    }
  }
}
