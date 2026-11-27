import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import {
  DownloadOptionsCatalog,
  DownloadRequest,
  DownloadSettings,
  FetchResult,
  MediaItem,
} from '@core/models';
import { FetchInfoService } from '@core/services/fetch-info.service';
import {
  defaultDownloadSettings,
  estimateSizeBytes,
  formatSize,
  sameSettings,
  settingsTag,
} from '@core/utils';

@Injectable({ providedIn: 'root' })
export class PlaylistStateService {
  private readonly fetchInfo = inject(FetchInfoService);

  /** The guards guarantee a result before any page exists. */
  private readonly result = computed(() => {
    const r = this.fetchInfo.lastResult();
    if (!r) throw new Error('PlaylistStateService used without a fetch result');
    return r;
  });

  readonly items = computed(() => this.result().items);
  readonly catalog = computed(() => this.result().catalog);
  readonly failedCount = computed(() => this.result().failed.length);

  /** ids the user wants in the batch. All selected when a result arrives. */
  readonly chosenIds = linkedSignal<FetchResult, string[]>({
    source: this.result,
    computation: (r) => r.items.map((i) => i.id),
  });

  readonly chosenItems = computed(() => {
    const ids = new Set(this.chosenIds());
    return this.items().filter((i) => ids.has(i.id));
  });

  /** rows ticked on the Options page. Empty means Global (all chosen items). */
  readonly selectedIds = linkedSignal<string[], string[]>({
    source: this.chosenIds,
    computation: () => [],
  });

  readonly isGlobal = computed(() => this.selectedIds().length === 0);

  /** the rows Apply and Download act on */
  readonly targetItems = computed(() => {
    if (this.isGlobal()) return this.chosenItems();
    const ids = new Set(this.selectedIds());
    return this.chosenItems().filter((i) => ids.has(i.id));
  });

  catalogFor(item: MediaItem): DownloadOptionsCatalog {
    return item.catalog ?? this.catalog();
  }

  readonly effectiveCatalog = computed(() => {
    const rows = this.targetItems();
    return rows.length === 1 ? this.catalogFor(rows[0]) : this.catalog();
  });

  private defaultsFor(item: MediaItem): DownloadSettings {
    return defaultDownloadSettings(this.catalogFor(item));
  }

  /** what the options panel currently shows (two-way bound to d4m-download-options) */
  readonly draft = linkedSignal<FetchResult, DownloadSettings>({
    source: this.result,
    computation: (r) => defaultDownloadSettings(r.catalog),
  });

  /** the draft as it was the last time Apply was pressed */
  private readonly appliedDraft = linkedSignal<FetchResult, DownloadSettings>({
    source: this.result,
    computation: (r) => defaultDownloadSettings(r.catalog),
  });

  /** settings stamped on a row by Apply. A missing id means the row still has default */
  readonly applied = linkedSignal<FetchResult, Record<string, DownloadSettings>>({
    source: this.result,
    computation: () => ({}),
  });

  /** true when the panel differs from what was last applied */
  readonly dirty = computed(() => !sameSettings(this.draft(), this.appliedDraft()));

  /** text for the row tag: null = "Default", otherwise e.g. "1080p · mp4" */
  tagFor(id: string): string | null {
    const s = this.applied()[id];
    return s ? settingsTag(s) : null;
  }

  settingsFor(id: string): DownloadSettings {
    const item = this.items().find((i) => i.id === id)!;
    return this.applied()[id] ?? this.defaultsFor(item);
  }

  sizeFor(id: string): number | null {
    const item = this.chosenItems().find((i) => i.id === id);
    if (!item) return null;
    const applied = this.applied()[id];
    if (!applied) return item.sizeBytes ?? null;
    return estimateSizeBytes(item.sizeBytes ?? null, applied, this.defaultsFor(item));
  }

  /** Apply: stamp the draft on every target row. Frontend only, no backend call. */
  apply(): void {
    const s = this.draft();
    const stamp = Object.fromEntries(this.targetItems().map((i) => [i.id, s]));
    this.applied.update((a) => ({ ...a, ...stamp }));
    this.appliedDraft.set(s);
  }

  /** what Download sends: one request per target row, each with its own settings */
  requests(): DownloadRequest[] {
    return this.targetItems().map((item) => ({ item, settings: this.settingsFor(item.id) }));
  }

  /** text for the right side of the list header, built from the target rows */
  readonly summary = computed(() => {
    const rows = this.targetItems();
    const known = rows.map((r) => this.sizeFor(r.id)).filter((b): b is number => b != null);
    const size = known.length ? ` · ${formatSize(known.reduce((a, b) => a + b, 0))}` : '';
    const n = rows.length;
    return this.isGlobal()
      ? `Global · ${n} ${n === 1 ? 'video' : 'videos'}${size}`
      : `${n} of ${this.chosenItems().length} selected${size}`;
  });
}
