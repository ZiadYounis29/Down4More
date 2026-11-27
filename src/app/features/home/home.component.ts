// STUB owned by P4: overwritten with the real implementation (P4 T5).
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UrlParserService } from '@core/services/url-parser.service';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { FetchResult } from '@core/models';
import { LogoComponent } from '@shared/components/logo';
import { PageContainerComponent } from '@shared/components/page-container';
import { UrlBarComponent } from './components/url-bar/url-bar.component';
import { UrlListComponent } from './components/url-list/url-list.component';
import { UrlEntry, MAX_LINKS } from './components/url-entry.model';

@Component({
  selector: 'd4m-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LogoComponent, PageContainerComponent, UrlBarComponent, UrlListComponent],
})
export class HomeComponent {
  private readonly fetchInfo = inject(FetchInfoService);
  private readonly urlParser = inject(UrlParserService);
  private readonly router = inject(Router);

  protected links = signal<UrlEntry[]>([]);
  protected draft = signal('');
  protected draftError = signal<string | null>(null);
  protected fetching = signal(false);
  protected fetchError = signal<string | null>(null);
  protected notice = signal('');

  protected canFetch = computed(() => this.links().length > 0 || this.draft().trim().length > 0);

  addFromDraft(): void {
    const raw = this.draft();
    const pieces = raw.split(/[\s,]+/).filter(p => p.length > 0);

    if (pieces.length === 0) return;

    const skipped: string[] = [];
    let allAdded = true;

    for (const piece of pieces) {
      const parsed = this.urlParser.parse(piece);

      if (!parsed.valid) {
        skipped.push(piece);
        allAdded = false;
        this.draftError.set("That doesn't look like a link.");
        continue;
      }

      if (this.links().some(l => l.key === parsed.key)) {
        skipped.push(piece);
        allAdded = false;
        this.draftError.set('Already in the list.');
        continue;
      }

      if (this.links().length >= MAX_LINKS) {
        skipped.push(piece);
        allAdded = false;
        this.draftError.set('You can add up to 50 links.');
        continue;
      }

      this.links.update(list => [
        ...list,
        { id: `u-${Date.now()}-${list.length}`, url: parsed.url, key: parsed.key, kind: parsed.kind },
      ]);
    }

    if (allAdded) {
      this.draft.set('');
      this.draftError.set(null);
      this.notice.set(`Link added, ${this.links().length} link${this.links().length === 1 ? '' : 's'} in the list`);
    } else {
      this.draft.set(skipped.join(' '));
    }
  }

  remove(id: string): void {
    this.links.update(list => list.filter(l => l.id !== id));
    this.notice.set('Link removed');
    if (this.fetchError()) this.fetchError.set(null);
  }

  clear(): void {
    this.links.set([]);
    this.notice.set('Link removed');
    this.fetchError.set(null);
  }

  fetch(): void {
    // Add the typed text first if present
    if (this.draft().trim().length > 0) {
      const before = this.links().length;
      this.addFromDraft();
      if (this.links().length === before) {
        // Adding the draft failed; error already set, stop
        return;
      }
    }

    if (this.links().length === 0) return;

    this.fetching.set(true);
    this.fetchError.set(null);

    const urls = this.links().map(l => l.url);

    this.fetchInfo.load(urls).subscribe({
      next: result => {
        this.fetching.set(false);

        const ok = result.items.length > 0;
        if (!ok) {
          // All links failed: mark every row failed, show message, stay on Home
          this.links.update(list => list.map(l => ({ ...l, failed: true })));
          this.fetchError.set("None of the links could be loaded. Check them and try again.");
          return;
        }

        // Mark failed rows by matching result.failed URLs to entry URLs
        const failedUrls = new Set(result.failed.map(f => f.url));
        this.links.update(list => list.map(l => ({ ...l, failed: failedUrls.has(l.url) })));

        this.router.navigate(result.kind === 'single' ? ['/single'] : ['/playlist', 'select']);
      },
      error: () => {
        this.fetching.set(false);
        this.fetchError.set("Couldn't reach the downloader. Try again.");
      },
    });
  }
}
