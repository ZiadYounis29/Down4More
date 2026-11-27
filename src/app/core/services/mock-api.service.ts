import { Injectable, signal } from '@angular/core';
import {
  interval,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  Subject,
  tap,
  timer,
} from 'rxjs';
import {
  generatePlaylistItems,
  MOCK_CATALOG,
  MOCK_MEDIA_ITEMS,
  MOCK_PLAYLIST_ITEMS,
  seedStore,
} from '@core/mocks/mock-data';
import {
  DownloadAction,
  DownloadItem,
  DownloadRequest,
  DownloadSettings,
  FetchFailure,
  FetchResult,
  MediaItem,
} from '@core/models';
import { fallbackQuality, nearestBitrate, parseUrl } from '@core/utils';
import { ApiService } from './api.service';

const MB = 1024 * 1024;
const MOCK_SPEEDS_BPS = [4.1 * MB, 6.3 * MB, 9.8 * MB, 17.2 * MB, 21.5 * MB].map(Math.round);
const MAX_CONCURRENT_DOWNLOADS = 3;
const PROCESSING_TICKS = 3;

@Injectable({ providedIn: 'root' })
export class MockApiService extends ApiService {
  private readonly initialSeed = seedStore();
  private readonly store = signal<DownloadItem[]>(this.initialSeed.items);
  private readonly dismissed = signal<Set<string>>(new Set(this.initialSeed.dismissedIds));

  private nextPriority = 1000;
  private nextDownloadId = 1;
  private mediaCursor = 0;
  private speedCursor = 0;
  private readonly processingTicks = new Map<string, number>();
  private readonly refresh$ = new Subject<void>();

  private readonly sharedDownloads$ = merge(
    of(-1),
    interval(1000).pipe(tap(() => this.advanceOneTick())),
    this.refresh$,
  ).pipe(
    map(() => this.visibleDownloads()),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  fetchInfo(urls: string[]): Observable<FetchResult> {
    return timer(600).pipe(map(() => this.buildFetchResult(urls)));
  }

  startDownloads(requests: DownloadRequest[]): Observable<void> {
    if (requests.length === 0) {
      return of(undefined);
    }

    const added: DownloadItem[] = requests.map((req) => {
      const catalog = req.item.catalog ?? MOCK_CATALOG;
      const resolved = this.resolveSettings(req.settings, catalog);
      const speedBps = MOCK_SPEEDS_BPS[this.speedCursor % MOCK_SPEEDS_BPS.length];
      this.speedCursor++;

      return {
        ...req.item,
        id: `dl-req-${this.nextDownloadId++}`,
        status: 'queued',
        progress: 0,
        downloadedBytes: 0,
        totalBytes: req.item.sizeBytes ?? null,
        speedBps,
        etaSec: null,
        settings: resolved,
        priority: this.nextPriority++,
        startedAt: new Date().toISOString(),
      };
    });

    this.store.update((items) => [...items, ...added]);
    this.refresh$.next();
    return of(undefined);
  }

  downloads$(): Observable<DownloadItem[]> {
    return this.sharedDownloads$;
  }

  control(action: DownloadAction, ids: string[]): Observable<void> {
    if (ids.length === 0) {
      return of(undefined);
    }
    const idSet = new Set(ids);

    switch (action) {
      case 'pause':
        this.store.update((items) =>
          items.map((item) =>
            idSet.has(item.id) &&
            (item.status === 'downloading' || item.status === 'queued')
              ? { ...item, status: 'paused', speedBps: null, etaSec: null }
              : item,
          ),
        );
        break;

      case 'resume':
        this.store.update((items) =>
          items.map((item) =>
            idSet.has(item.id) && item.status === 'paused'
              ? {
                  ...item,
                  status: 'queued',
                  speedBps:
                    item.speedBps ??
                    MOCK_SPEEDS_BPS[this.speedCursor++ % MOCK_SPEEDS_BPS.length],
                }
              : item,
          ),
        );
        break;

      case 'cancel':
      case 'remove':
        for (const id of ids) {
          this.processingTicks.delete(id);
        }
        this.store.update((items) => items.filter((item) => !idSet.has(item.id)));
        break;

      case 'retry':
        this.store.update((items) =>
          items.map((item) => {
            if (!idSet.has(item.id) || item.status !== 'failed') return item;
            const { error: _err, finishedAt: _fin, ...rest } = item;
            return {
              ...rest,
              status: 'queued',
              progress: 0,
              downloadedBytes: 0,
              speedBps:
                item.speedBps ??
                MOCK_SPEEDS_BPS[this.speedCursor++ % MOCK_SPEEDS_BPS.length],
              etaSec: null,
            };
          }),
        );
        break;

      case 'prioritize':
        this.store.update((items) => {
          const minPriority = items.reduce((min, it) => Math.min(min, it.priority), 1);
          const priorityMap = new Map<string, number>();
          let next = minPriority - ids.length;
          for (const id of ids) {
            if (!priorityMap.has(id)) {
              priorityMap.set(id, next++);
            }
          }
          return items.map((item) =>
            priorityMap.has(item.id)
              ? { ...item, priority: priorityMap.get(item.id)! }
              : item,
          );
        });
        break;

      case 'dismiss':
        this.dismissed.update((set) => {
          const next = new Set(set);
          for (const id of ids) next.add(id);
          return next;
        });
        break;
    }

    this.refresh$.next();
    return of(undefined);
  }

  history(query?: string): Observable<DownloadItem[]> {
    const q = query?.trim().toLowerCase() ?? '';
    const rows = this.store()
      .filter((d) => d.status === 'done' || d.status === 'failed')
      .filter((d) => !q || d.title.toLowerCase().includes(q))
      .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
    return of(rows);
  }

  private visibleDownloads(): DownloadItem[] {
    const hidden = this.dismissed();
    return this.store().filter((d) => !hidden.has(d.id));
  }

  private buildFetchResult(urls: string[]): FetchResult {
    const items: MediaItem[] = [];
    const failed: FetchFailure[] = [];
    const usedIds = new Set<string>();
    let playlistTitle: string | undefined;

    for (const raw of urls) {
      const parsed = parseUrl(raw);
      if (raw.toLowerCase().includes('fail') || !parsed.valid) {
        failed.push({
          url: raw,
          reason: parsed.valid ? "Couldn't load this link." : 'Not a valid link.',
        });
        continue;
      }

      if (parsed.kind === 'playlist') {
        const batch = raw.toLowerCase().includes('big')
          ? generatePlaylistItems(300)
          : MOCK_PLAYLIST_ITEMS;
        for (const item of batch) {
          items.push(this.withUniqueId(item, usedIds));
        }
        if (urls.length === 1) {
          playlistTitle = 'Down4More Playlist';
        }
      } else {
        const picked = MOCK_MEDIA_ITEMS[this.mediaCursor % MOCK_MEDIA_ITEMS.length];
        this.mediaCursor++;
        items.push(this.withUniqueId(picked, usedIds));
      }
    }

    const kind = urls.length === 1 && items.length === 1 ? 'single' : 'playlist';
    return {
      kind,
      items,
      catalog: MOCK_CATALOG,
      failed,
      ...(playlistTitle ? { title: playlistTitle } : {}),
    };
  }

  private withUniqueId(item: MediaItem, usedIds: Set<string>): MediaItem {
    let id = item.id;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${item.id}-${suffix++}`;
    }
    usedIds.add(id);
    return { ...item, id };
  }

  private resolveSettings(
    settings: DownloadSettings,
    catalog: typeof MOCK_CATALOG,
  ): DownloadSettings {
    const validFormats =
      settings.mode === 'audio-only' ? catalog.audioFormats : catalog.videoFormats;
    const format = validFormats.includes(settings.format)
      ? settings.format
      : (validFormats[0] ?? settings.format);

    const quality =
      settings.quality == null ? null : fallbackQuality(settings.quality, catalog.qualities);
    const bitrate =
      settings.bitrate == null ? null : nearestBitrate(settings.bitrate, catalog.bitrates);

    return {
      ...settings,
      quality,
      bitrate,
      format,
    };
  }

  private advanceOneTick(): void {
    const current = this.store();
    const activeCount = current.filter((d) => d.status === 'downloading').length;
    const slotsAvailable = Math.max(0, MAX_CONCURRENT_DOWNLOADS - activeCount);

    const toStart = new Set<string>();
    if (slotsAvailable > 0) {
      const queued = current
        .filter((d) => d.status === 'queued')
        .sort((a, b) => a.priority - b.priority)
        .slice(0, slotsAvailable);
      for (const q of queued) toStart.add(q.id);
    }

    const nowIso = new Date().toISOString();

    const updated = current.map((item): DownloadItem => {
      if (toStart.has(item.id)) {
        const speedBps =
          item.speedBps ?? MOCK_SPEEDS_BPS[this.speedCursor++ % MOCK_SPEEDS_BPS.length];
        return {
          ...item,
          status: 'downloading',
          speedBps,
        };
      }

      if (item.status === 'downloading') {
        const speedBps =
          item.speedBps ?? MOCK_SPEEDS_BPS[this.speedCursor++ % MOCK_SPEEDS_BPS.length];

        let downloadedBytes = item.downloadedBytes;
        let progress = item.progress;
        let etaSec: number | null = item.etaSec;

        if (item.totalBytes === null || item.totalBytes <= 0) {
          downloadedBytes += speedBps;
          progress = Math.min(100, item.progress + 2);
          etaSec = null;
        } else {
          downloadedBytes = Math.min(item.totalBytes, item.downloadedBytes + speedBps);
          progress = Math.min(100, Math.round((downloadedBytes / item.totalBytes) * 100));
          const remaining = Math.max(0, item.totalBytes - downloadedBytes);
          etaSec = remaining === 0 ? 0 : Math.ceil(remaining / speedBps);
        }

        if (/\bfail\b/i.test(item.title) && progress >= 50) {
          return {
            ...item,
            status: 'failed',
            downloadedBytes,
            progress,
            speedBps: null,
            etaSec: null,
            error: 'Network error',
            finishedAt: nowIso,
          };
        }

        if (progress >= 100) {
          this.processingTicks.set(item.id, PROCESSING_TICKS);
          return {
            ...item,
            status: 'processing',
            progress: 100,
            downloadedBytes: item.totalBytes ?? downloadedBytes,
            speedBps: null,
            etaSec: null,
          };
        }

        return {
          ...item,
          downloadedBytes,
          progress,
          speedBps,
          etaSec,
        };
      }

      if (item.status === 'processing') {
        const left = (this.processingTicks.get(item.id) ?? PROCESSING_TICKS) - 1;
        if (left <= 0) {
          this.processingTicks.delete(item.id);
          return {
            ...item,
            status: 'done',
            progress: 100,
            speedBps: null,
            etaSec: null,
            finishedAt: nowIso,
          };
        }
        this.processingTicks.set(item.id, left);
        return item;
      }

      return item;
    });

    this.store.set(updated);
  }
}
