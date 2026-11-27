// STUB owned by P4: overwritten with the real implementation (P4 T3).
// Unresolved imports (not on main yet): @core/utils/parse-url, @core/utils/fallback-quality,
// @core/utils/nearest-bitrate — owned by P3 T1/T2. Imports left in place per the missing-dependency rule.
import { Injectable, signal } from '@angular/core';
import { delay, interval, map, of, share, startWith, Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  DownloadAction,
  DownloadItem,
  DownloadOptionsCatalog,
  DownloadRequest,
  FetchResult,
  FetchFailure,
  MediaItem,
} from '@core/models';
import {
  MOCK_CATALOG,
  MOCK_MEDIA_ITEMS,
  MOCK_PLAYLIST_ITEMS,
  generatePlaylistItems,
  seedStore,
} from '@core/mocks/mock-data';
import { parseUrl } from '@core/utils/parse-url';
import { fallbackQuality } from '@core/utils/fallback-quality';
import { nearestBitrate } from '@core/utils/nearest-bitrate';

const SPEEDS_MBPS = [4.1, 6.3, 9.8, 17.2, 21.5];

@Injectable({ providedIn: 'root' })
export class MockApiService extends ApiService {
  private store = signal<DownloadItem[]>(seedStore().items);
  private dismissed = signal<Set<string>>(new Set(seedStore().dismissedIds));
  private nextPriority = 1000;
  private speedCounter = 0;
  private processingTicks = new Map<string, number>();

  fetchInfo(urls: string[]): Observable<FetchResult> {
    return of(this.buildFetchResult(urls)).pipe(delay(600));
  }

  private buildFetchResult(urls: string[]): FetchResult {
    const failed: FetchFailure[] = [];
    const items: MediaItem[] = [];
    const seenIds = new Map<string, number>();
    let mediaItemIndex = 0;

    for (const rawUrl of urls) {
      const containsFail = rawUrl.toLowerCase().includes('fail');
      const parsed = parseUrl(rawUrl);

      if (!parsed.valid || containsFail) {
        failed.push({
          url: rawUrl,
          reason: containsFail
            ? 'Link contains "fail"'
            : parsed.reason ?? 'not-a-link',
        });
        continue;
      }

      let sourceItems: MediaItem[];
      if (parsed.kind === 'playlist' && rawUrl.toLowerCase().includes('big')) {
        sourceItems = generatePlaylistItems(300);
      } else if (parsed.kind === 'video' || parsed.kind === 'unknown') {
        sourceItems = [MOCK_MEDIA_ITEMS[mediaItemIndex % MOCK_MEDIA_ITEMS.length]];
        mediaItemIndex++;
      } else {
        sourceItems = [...MOCK_PLAYLIST_ITEMS];
      }

      for (const item of sourceItems) {
        const baseId = item.id;
        let finalId = baseId;
        const count = seenIds.get(baseId) ?? 0;
        if (count > 0) {
          finalId = `${baseId}-${count + 1}`;
        }
        seenIds.set(baseId, count + 1);

        items.push({ ...item, id: finalId });
      }
    }

    const kind = urls.length === 1 && items.length === 1 ? 'single' : 'playlist';
    const title = kind === 'playlist' && urls.length === 1 ? urls[0] : undefined;

    return {
      kind,
      items,
      catalog: MOCK_CATALOG,
      failed,
      ...(title ? { title } : {}),
    };
  }

  startDownloads(requests: DownloadRequest[]): Observable<void> {
    for (const request of requests) {
      const catalog = request.item.catalog ?? MOCK_CATALOG;
      const resolved = this.resolveSettings(request.settings, catalog);

      const speedBps = SPEEDS_MBPS[this.speedCounter % SPEEDS_MBPS.length] * 1024 * 1024;
      this.speedCounter++;

      const item: DownloadItem = {
        ...request.item,
        status: 'queued',
        progress: 0,
        downloadedBytes: 0,
        totalBytes: request.item.sizeBytes ?? null,
        speedBps,
        etaSec: null,
        settings: resolved,
        priority: this.nextPriority++,
      };

      this.store.update(current => [...current, item]);
    }

    return of(undefined);
  }

  private resolveSettings(
    settings: DownloadItem['settings'],
    catalog: DownloadOptionsCatalog
  ): DownloadItem['settings'] {
    const isAudio = settings.mode === 'audio-only';
    const validFormats = isAudio ? catalog.audioFormats : catalog.videoFormats;

    return {
      mode: settings.mode,
      quality: settings.quality == null ? null : fallbackQuality(settings.quality, catalog.qualities),
      bitrate: settings.bitrate == null ? null : nearestBitrate(settings.bitrate, catalog.bitrates),
      format: validFormats.includes(settings.format) ? settings.format : validFormats[0],
      captions: settings.captions,
    };
  }

  downloads$(): Observable<DownloadItem[]> {
    return interval(1000).pipe(
      startWith(0),
      map(() => {
        this.advanceOneTick();
        return this.store().filter(d => !this.dismissed().has(d.id));
      }),
      share({ refCount: true })
    );
  }

  private advanceOneTick(): void {
    this.store.update(items => {
      const result = [...items];

      // 1. Concurrency: at most 3 downloading. Cap only controls STARTING items.
      const downloadingCount = result.filter(i => i.status === 'downloading').length;
      const slots = Math.max(0, 3 - downloadingCount);
      if (slots > 0) {
        const queued = result
          .filter(i => i.status === 'queued')
          .sort((a, b) => a.priority - b.priority)
          .slice(0, slots);
        for (const item of queued) {
          const idx = result.findIndex(i => i.id === item.id);
          if (idx !== -1) {
            result[idx] = { ...result[idx], status: 'downloading' };
          }
        }
      }

      // 2. Advance downloading items
      for (let idx = 0; idx < result.length; idx++) {
        const item = result[idx];
        if (item.status !== 'downloading') continue;

        const speedBps = item.speedBps ?? 0;
        const newDownloaded = item.downloadedBytes + speedBps;

        let newProgress: number;
        let newEta: number | null;

        if (item.totalBytes != null) {
          newProgress = Math.min(100, Math.round((newDownloaded / item.totalBytes) * 100));
          const remaining = item.totalBytes - newDownloaded;
          newEta = speedBps > 0 ? remaining / speedBps : null;
        } else {
          newProgress = Math.min(100, item.progress + 2);
          newEta = null;
        }

        // Fail at 50% when title contains "fail"
        if (item.title.toLowerCase().includes('fail') && newProgress >= 50) {
          result[idx] = {
            ...item,
            status: 'failed',
            error: 'Network error',
            speedBps: null,
            etaSec: null,
          };
          continue;
        }

        const updated: DownloadItem = {
          ...item,
          downloadedBytes: newDownloaded,
          progress: newProgress,
          etaSec: newEta,
        };

        // Progress 100 -> processing for 3 ticks, then done
        if (newProgress === 100) {
          updated.status = 'processing';
          updated.speedBps = null;
          updated.etaSec = null;
          this.processingTicks.set(updated.id, 3);
        }

        result[idx] = updated;
      }

      // 3. Decrement processing ticks -> done
      for (const [id, ticksLeft] of this.processingTicks) {
        const idx = result.findIndex(i => i.id === id);
        if (idx === -1) continue;
        const newTicks = ticksLeft - 1;
        if (newTicks <= 0) {
          result[idx] = {
            ...result[idx],
            status: 'done',
            finishedAt: new Date().toISOString(),
          };
          this.processingTicks.delete(id);
        } else {
          this.processingTicks.set(id, newTicks);
        }
      }

      return result;
    });
  }

  control(action: DownloadAction, ids: string[]): Observable<void> {
    const idSet = new Set(ids);

    switch (action) {
      case 'pause':
        this.store.update(items =>
          items.map(i =>
            idSet.has(i.id) && i.status === 'downloading'
              ? { ...i, status: 'paused', speedBps: null, etaSec: null }
              : i
          )
        );
        break;
      case 'resume':
        this.store.update(items =>
          items.map(i =>
            idSet.has(i.id) && i.status === 'paused'
              ? { ...i, status: 'queued' }
              : i
          )
        );
        break;
      case 'cancel':
        this.store.update(items => items.filter(i => !idSet.has(i.id)));
        break;
      case 'retry':
        this.store.update(items =>
          items.map(i =>
            idSet.has(i.id) && i.status === 'failed'
              ? {
                  ...i,
                  status: 'queued',
                  error: undefined,
                  finishedAt: undefined,
                  progress: 0,
                  downloadedBytes: 0,
                }
              : i
          )
        );
        break;
      case 'remove':
        this.store.update(items => items.filter(i => !idSet.has(i.id)));
        break;
      case 'prioritize':
        this.store.update(items => {
          const targets = items.filter(i => idSet.has(i.id));
          const others = items.filter(i => !idSet.has(i.id));
          const minPriority = Math.min(0, ...others.map(i => i.priority)) - 1;
          const prioritized = targets.map((i, index) => ({
            ...i,
            priority: minPriority + index,
          }));
          return [...others, ...prioritized].sort((a, b) => a.priority - b.priority);
        });
        break;
      case 'dismiss':
        this.dismissed.update(d => {
          const next = new Set(d);
          for (const id of ids) next.add(id);
          return next;
        });
        break;
    }

    return of(undefined);
  }

  history(query?: string): Observable<DownloadItem[]> {
    const rows = this.store()
      .filter(d => d.status === 'done' || d.status === 'failed')
      .filter(d => !query || d.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
    return of(rows);
  }
}
