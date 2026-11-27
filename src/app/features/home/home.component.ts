import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { UrlParserService } from '@core/services/url-parser.service';
import { LogoComponent } from '@shared/components/logo';
import { PageContainerComponent } from '@shared/components/page-container';
import { UrlBarComponent } from './components/url-bar';
import { UrlListComponent } from './components/url-list';
import { MAX_LINKS, UrlEntry } from './url-entry.model';

@Component({
  selector: 'd4m-home',
  imports: [PageContainerComponent, LogoComponent, UrlBarComponent, UrlListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LogoComponent, PageContainerComponent, UrlBarComponent, UrlListComponent],
})
export class HomeComponent {
  private readonly parser = inject(UrlParserService);
  private readonly fetchInfo = inject(FetchInfoService);
  private readonly router = inject(Router);

  private readonly urlBar = viewChild(UrlBarComponent);
  private nextId = 1;

  protected readonly links = signal<UrlEntry[]>([]);
  protected readonly draft = signal('');
  protected readonly draftError = signal<string | null>(null);
  protected readonly fetching = signal(false);
  protected readonly fetchError = signal<string | null>(null);
  protected readonly announcement = signal('');

  protected readonly canFetch = computed(
    () => this.links().length > 0 || this.draft().trim().length > 0,
  );

  protected addFromDraft(): boolean {
    const raw = this.draft();
    const pieces = raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (pieces.length === 0) {
      return true;
    }

    const current = this.links();
    const existingKeys = new Set(current.map((e) => e.key));
    const added: UrlEntry[] = [];
    const skipped: string[] = [];
    let firstError: string | null = null;

    for (const piece of pieces) {
      const parsed = this.parser.parse(piece);
      if (!parsed.valid) {
        skipped.push(piece);
        firstError ??= "That doesn't look like a link.";
        continue;
      }

      if (existingKeys.has(parsed.key)) {
        skipped.push(piece);
        firstError ??= 'Already in the list.';
        continue;
      }

      if (current.length + added.length >= MAX_LINKS) {
        skipped.push(piece);
        firstError ??= `You can add up to ${MAX_LINKS} links.`;
        continue;
      }

      existingKeys.add(parsed.key);
      added.push({
        id: `url-${this.nextId++}`,
        url: parsed.url,
        key: parsed.key,
        kind: parsed.kind,
      });
    }

    if (added.length > 0) {
      const nextList = [...current, ...added];
      this.links.set(nextList);
      this.fetchError.set(null);
      this.announcement.set(`Link added, ${nextList.length} ${nextList.length === 1 ? 'link' : 'links'} in the list`);
    }

    if (skipped.length > 0) {
      this.draft.set(skipped.join(' '));
      this.draftError.set(firstError);
      this.urlBar()?.focus();
      return false;
    }

    this.draft.set('');
    this.draftError.set(null);
    this.urlBar()?.focus();
    return true;
  }

  protected remove(id: string): void {
    this.links.update((list) => list.filter((e) => e.id !== id));
    this.draftError.set(null);
    this.fetchError.set(null);
    this.announcement.set('Link removed');
    this.urlBar()?.focus();
  }

  protected clear(): void {
    this.links.set([]);
    this.draftError.set(null);
    this.fetchError.set(null);
    this.urlBar()?.focus();
  }

  protected fetch(): void {
    if (this.draft().trim().length > 0) {
      const ok = this.addFromDraft();
      if (!ok) return;
    }

    const entries = this.links();
    if (entries.length === 0) return;

    this.fetchError.set(null);
    this.links.set(entries.map(({ failed: _failed, ...rest }) => rest));
    this.fetching.set(true);

    this.fetchInfo.load(entries.map((e) => e.url)).subscribe({
      next: (result) => {
        this.fetching.set(false);
        if (result.items.length === 0) {
          const failedSet = new Set(result.failed.map((f) => f.url));
          this.links.update((list) =>
            list.map((e) => ({
              ...e,
              failed: failedSet.size === 0 || failedSet.has(e.url),
            })),
          );
          this.fetchError.set('None of the links could be loaded. Check them and try again.');
          return;
        }
        this.router.navigate(result.kind === 'single' ? ['/single'] : ['/playlist', 'select']);
      },
      error: () => {
        this.fetching.set(false);
        this.fetchError.set("Couldn't reach the downloader. Try again.");
      },
    });
  }
}
