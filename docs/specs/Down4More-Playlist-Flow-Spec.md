# Down4More: Playlist / Batch Flow Spec (shared part)

> **Scope:** `src/app/features/playlist/`, the two pages of the flow and what they share. The pages have their own files:
> - `Down4More-Playlist-Select-Page-Spec.md` (step 1: choose the videos)
> - `Down4More-Playlist-Options-Page-Spec.md` (step 2: apply settings and download)
>
> Companions: `Down4More-Shared-Components-Spec.md` (tokens, `page-container`, `nav-buttons`, `download-options`, `media-thumbnail`, `item-container`), `Down4More-Home-Page-Spec.md` (where the flow starts), `Down4More-Core-Shell-Spec.md`.
> **Design sources:** the pre-select screen in the Excalidraw SVG (select all, rows with name and duration, Next) and `Down4More___Batch_options.html` (the prototype for step 2). Where the prototype and the shared spec disagree, section 7 says which one wins.
> **(rev 4)** `Down4More-Per-Video-Options-Spec.md` overrides section 4 (`catalogFor`, `effectiveCatalog`, `defaultsFor` replace `defaults`) and adds three items with their own `catalog` to section 6. Where this file and that one disagree, that one wins.
> **Assumed stack:** Angular 19+ (uses `linkedSignal`). On 17/18 replace `linkedSignal` with a `signal` plus an `effect` that resets it.

---

## 0. The flow in one minute

1. Home fetches one or more links and lands here whenever the result is a playlist or a batch (two or more links). One link that is a single video goes to Single instead.
2. **Step 1, Select** (`/playlist/select`): every fetched video is in one list. The user ticks the ones they want and presses **Next**.
3. **Step 2, Options** (`/playlist/options`): only the chosen videos are listed. The user sets download options once for **all** of them (**Global**), or ticks some rows and sets options for just those. **Apply** stamps the options on the target rows. **Download (N)** starts the downloads for the target rows.
4. Both steps share one state object (`PlaylistStateService`) so **Back** never loses anything.

---

## 1. Naming (replaces "pre-fetch" / "post-fetch")

| Old name | New name | Why |
|---|---|---|
| pre-fetch, "pre-select" | **Select** | the only job of the page is choosing videos |
| post-fetch, "option-select" | **Options** | the page is about download options |
| route `/playlist/pre-fetch` | `/playlist/select` | |
| route `/playlist/post-fetch` | `/playlist/options` | |
| `pre-fetch/`, `post-fetch/` folders | `select/`, `options/` | |
| components `apply-settings`, `export-settings` | **removed** | Apply and Download are two buttons in the side panel of the Options page, not components |

The feature folder stays `playlist` (agreed structure). It also serves multi-link batches, because Home treats a batch as a playlist (Home spec, section 5). `media-thumbnail` keeps its variant names `pre-select` and `option-select`.

---

## 2. Files and routes

```
features/playlist/
├─ playlist.routes.ts
├─ guards/
│  ├─ has-fetch-result.guard.ts
│  └─ has-chosen.guard.ts
├─ services/
│  └─ playlist-state.service.ts          (section 4)
├─ select/
│  └─ playlist-select.component.ts / .html / .scss
└─ options/
   └─ playlist-options.component.ts / .html / .scss
core/
├─ utils/settings-tag.ts                 (section 5, with .spec.ts)
├─ utils/same-settings.ts                (section 5, with .spec.ts)
└─ services/download.service.ts          (thin wrapper: start(requests) calls ApiService.startDownloads)
```

```ts
// playlist.routes.ts
export const PLAYLIST_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'select' },
  { path: 'select',  canActivate: [hasFetchResultGuard],
    loadComponent: () => import('./select/playlist-select.component').then(m => m.PlaylistSelectComponent) },
  { path: 'options', canActivate: [hasFetchResultGuard, hasChosenGuard],
    loadComponent: () => import('./options/playlist-options.component').then(m => m.PlaylistOptionsComponent) },
];

// app.routes.ts
{ path: 'playlist', loadChildren: () => import('./features/playlist/playlist.routes').then(m => m.PLAYLIST_ROUTES) },
```

---

## 3. Guards

Refreshing the browser on a page of this flow loses the in-memory result (Home spec, section 5). The guards turn that into a clean redirect instead of a broken page.

| Guard | Passes when | Otherwise |
|---|---|---|
| `hasFetchResultGuard` | `FetchInfoService.lastResult()` is set and has at least 1 item | redirect to `/` |
| `hasChosenGuard` | `FetchInfoService.lastResult()` is set **and** `PlaylistStateService.chosenIds().length > 0` | no result: redirect to `/`. Result but nothing chosen: redirect to `/playlist/select` |

Both return a `UrlTree` (`inject(Router).parseUrl(...)`), not a `navigate()` call.

**(rev 3) `hasChosenGuard` must check `lastResult()` itself, before it touches `PlaylistStateService`.** Angular starts every guard in the `canActivate` array, it does not stop at the first one that redirects. On a refresh of `/playlist/options` the second guard would run with no result, and the state service throws in that case (section 4), so the user would see a navigation error instead of Home.

```ts
export const hasChosenGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (!inject(FetchInfoService).lastResult()) return router.parseUrl('/');
  return inject(PlaylistStateService).chosenIds().length > 0 ? true : router.parseUrl('/playlist/select');
};
```

---

## 4. `PlaylistStateService`

`features/playlist/services/playlist-state.service.ts`. `providedIn: 'root'`. It reads `FetchInfoService.lastResult` and owns everything the two pages share. Pages read signals and call methods. They never hold their own copy of any of this.

**It resets itself.** Every field that depends on the fetch result is a `linkedSignal`, so a new fetch (a new `lastResult` object) resets selection, applied settings and the draft automatically. No route-level provider tricks are needed (route providers are not destroyed on navigation).

```ts
@Injectable({ providedIn: 'root' })
export class PlaylistStateService {
  private readonly fetchInfo = inject(FetchInfoService);

  /** The guards guarantee a result before any page exists. Throwing makes a wrong route obvious. */
  private readonly result = computed(() => {
    const r = this.fetchInfo.lastResult();
    if (!r) throw new Error('PlaylistStateService used without a fetch result');
    return r;
  });

  readonly items       = computed(() => this.result().items);
  readonly catalog     = computed(() => this.result().catalog);
  readonly failedCount = computed(() => this.result().failed.length);

  // ---- Step 1: Select ----------------------------------------------------
  /** ids the user wants in the batch. All selected when a result arrives. */
  readonly chosenIds = linkedSignal<FetchResult, string[]>({
    source: this.result,
    computation: r => r.items.map(i => i.id),
  });
  readonly chosenItems = computed(() => {
    const ids = new Set(this.chosenIds());
    return this.items().filter(i => ids.has(i.id));
  });

  // ---- Step 2: Options ---------------------------------------------------
  /** rows ticked on the Options page. Empty means Global (all chosen items). Resets when chosenIds changes. */
  readonly selectedIds = linkedSignal<string[], string[]>({ source: this.chosenIds, computation: () => [] });
  readonly isGlobal    = computed(() => this.selectedIds().length === 0);
  /** the rows Apply and Download act on */
  readonly targetItems = computed(() => {
    if (this.isGlobal()) return this.chosenItems();
    const ids = new Set(this.selectedIds());
    return this.chosenItems().filter(i => ids.has(i.id));
  });

  /** (rev 4, Per-Video spec 2.1) the options each video really has, and what the options panel offers */
  catalogFor(item: MediaItem): DownloadOptionsCatalog { return item.catalog ?? this.catalog(); }
  readonly effectiveCatalog = computed(() => {
    const rows = this.targetItems();
    return rows.length === 1 ? this.catalogFor(rows[0]) : this.catalog();   // one video: its own; several: the main catalog
  });
  private defaultsFor(item: MediaItem): DownloadSettings { return defaultDownloadSettings(this.catalogFor(item)); }

  /** what the options panel currently shows (two-way bound to d4m-download-options) */
  readonly draft = linkedSignal<FetchResult, DownloadSettings>({
    source: this.result, computation: r => defaultDownloadSettings(r.catalog),
  });
  /** the draft as it was the last time Apply was pressed */
  private readonly appliedDraft = linkedSignal<FetchResult, DownloadSettings>({
    source: this.result, computation: r => defaultDownloadSettings(r.catalog),
  });
  /** settings stamped on a row by Apply. A missing id means the row still has the default */
  readonly applied = linkedSignal<FetchResult, Record<string, DownloadSettings>>({
    source: this.result, computation: () => ({}),
  });

  /** true when the panel differs from what was last applied */
  readonly dirty = computed(() => !sameSettings(this.draft(), this.appliedDraft()));

  /** text for the row tag: null = "Default", otherwise e.g. "1080p · mp4" */
  tagFor(id: string): string | null {
    const s = this.applied()[id];
    return s ? settingsTag(s) : null;
  }

  settingsFor(id: string): DownloadSettings {
    const item = this.items().find(i => i.id === id)!;
    return this.applied()[id] ?? this.defaultsFor(item);
  }

  /** Apply: stamp the draft on every target row. Frontend only, no backend call. */
  apply(): void {
    const s = this.draft();
    const stamp = Object.fromEntries(this.targetItems().map(i => [i.id, s]));
    this.applied.update(a => ({ ...a, ...stamp }));
    this.appliedDraft.set(s);
  }

  /** what Download sends: one request per target row, each with its own settings */
  requests(): DownloadRequest[] {
    return this.targetItems().map(item => ({ item, settings: this.settingsFor(item.id) }));
  }

  /** text for the right side of the list header, built from the target rows */
  readonly summary = computed(() => {
    const rows = this.targetItems();
    const known = rows.map(r => r.sizeBytes).filter((b): b is number => b != null);
    const size = known.length ? ` · ${formatSize(known.reduce((a, b) => a + b, 0))}` : '';
    const n = rows.length;
    return this.isGlobal()
      ? `Global · ${n} ${n === 1 ? 'video' : 'videos'}${size}`
      : `${n} of ${this.chosenItems().length} selected${size}`;
  });
}
```

**Rules**
- `chosenIds` is written by the Select page (two-way bound to `item-container`). `selectedIds`, `draft` and `apply()` are used only by the Options page.
- Changing `chosenIds` (going Back and ticking differently) resets `selectedIds` to Global. **Applied settings of videos that are still chosen are kept.**
- `apply()` writes to the **target rows**: the ticked rows, or every chosen row in Global. It does not touch rows outside the target.
- Selecting a row does **not** load that row's applied settings into the panel (this is how the prototype behaves). The panel always shows `draft`.
- A row that was never applied downloads with the **default** settings, shown as the "Default" tag. **(rev 4)** The default comes from that video's own `catalog`.
- `sizeBytes` is whatever `fetchInfo` returned. Apply does not change it in v1 (open decision 6 of the shared spec). The summary adds up the known sizes and leaves the size out if none is known.

**Unit tests (required):** reset on a new `lastResult`; `chosenItems` follows `chosenIds`; `isGlobal` and `targetItems` in Global and with 2 rows ticked; `apply()` in Global stamps all, with ticks stamps only those, and clears `dirty`; `dirty` turns true when the draft changes and false after `apply()`; `requests()` uses applied settings and falls back to defaults; `summary` text for Global, selected, 1 video, and no known sizes.

---

## 5. Pure helpers (core/utils, no Angular, unit-tested)

```ts
// settings-tag.ts: the red tag text on an Options row (taken from the prototype)
export function settingsTag(s: DownloadSettings): string {
  if (s.mode === 'audio-only') return s.bitrate != null ? `${s.format} · ${s.bitrate}k` : s.format;
  const base = `${s.quality} · ${s.format}`;
  return s.mode === 'video-only' ? `${base} · video only` : base;
}

// same-settings.ts: field by field comparison (captions is an object)
export function sameSettings(a: DownloadSettings, b: DownloadSettings): boolean {
  return a.mode === b.mode && a.quality === b.quality && a.format === b.format &&
         a.bitrate === b.bitrate &&
         a.captions.enabled === b.captions.enabled && a.captions.separateFile === b.captions.separateFile;
}
```

| Input | `settingsTag` |
|---|---|
| video+audio, 1080p, mp4 | `1080p · mp4` |
| video-only, 720p, mkv | `720p · mkv · video only` |
| audio-only, mp3, 300 | `mp3 · 300k` |
| audio-only, mp3, bitrate null | `mp3` |

Captions are not part of the tag (as in the prototype).

---

## 6. Mock data for the flow

`MockApiService.fetchInfo` already returns 9 items for a playlist link (Home spec, section 9). Use exactly these (names, sizes and durations from the Batch design). Sizes use 1024-based MB so `formatSize` prints the number below.

| Title | Size | `sizeBytes` | Duration | `durationSec` |
|---|---|---|---|---|
| Rocket landing, full broadcast | 40 MB | 41943040 | 12:48 | 768 |
| How tides actually work | 28 MB | 29360128 | 08:15 | 495 |
| Street food tour: Alexandria | 112 MB | 117440512 | 24:03 | 1443 |
| Lo-fi study mix, 2 hours | 96 MB | 100663296 | 2:00:00 | 7200 |
| Desert timelapse in 4K | 64 MB | 67108864 | 03:27 | 207 |
| Interview: building a boat | 73 MB | 76546048 | 41:12 | 2472 |
| Morning run routine | 19 MB | 19922944 | 05:50 | 350 |
| Keyboard sound test | 12 MB | 12582912 | 02:09 | 129 |
| Documentary: the Nile delta | 204 MB | 213909504 | 58:30 | 3510 |

Extra mock rules so every state can be tried:
- **(rev 4)** three of the 9 items carry their own `catalog` (p-4, p-8, p-9; exact values in `Down4More-Per-Video-Options-Spec.md` section 3). All other items use `MOCK_CATALOG`
- a link containing `big` gives **300** generated items (virtual scroll check)
- one of the 9 items gets a very long title, one gets `thumbnailUrl: null`, one gets `sizeBytes: null`, one gets `durationSec: null`
- `MOCK_CATALOG`: qualities `2160p 1440p 1080p 720p 480p 360p`; video formats `mp4 mkv webm`; audio formats `mp3 m4a opus wav`; bitrate `{ min: 32, max: 320, step: 1 }`. `defaultDownloadSettings` returns video+audio, 1080p, mp4, captions off, separate file off, bitrate **300** (the prototype's starting values)

---

## 7. Changes to other specs (applied in shared spec rev 3 and the Home spec; kept here as a record)

**Home spec**
- Replace every `/playlist/pre-fetch` and "pre-fetch page" with `/playlist/select` and "Select page" (sections 0, 5 and 8 and the navigation code).
- Section 7, "Some links failed": the next page is the Select page and it shows the notice (Select spec, section 4).

**Shared components spec**
- 6.3 usage example: `this.router.navigate(['..', 'pre-fetch'])` becomes `this.router.navigate(['/playlist', 'select'])`. Rename "playlist pre/post-fetch" to "playlist select / options" in 6.3, 6.5 ("Used by") and in all of section 7 (reuse matrix and handler table).
- 6.5 `media-thumbnail`, three small changes:
  1. **New input `showCheckbox: boolean`, default `true`.** When `false` the checkbox is not rendered. The Options page sets it to `false` in Global mode (the prototype hides the checkboxes there).
  2. **`option-select`: a click anywhere on the row toggles selection**, the whole row is one `<button aria-pressed>` (as in the Batch design, 4.6.10). The `activate` output and the `active` input stay in the API but this flow does not use them.
  3. Nothing else changes. `pre-select` is as written.
- 6.7 `item-container`: no change. `noSelectionMeansAll`, `selectAllLabel` and `summary` already cover Global mode.
- Handler table (section 7): "Pre-fetch Next" becomes "Select, Next: navigate to Options. **No backend call in v1**" (sizes come from `fetchInfo`).

**Session handoff (folder tree and dependency map)**
- Replace `pre-fetch/` and `post-fetch/ (components: apply-settings, export-settings)` with `select/` and `options/` (section 2 above).

---

## 8. Choices I made that you can change

1. Names **Select** and **Options**, folder stays `playlist` (section 1).
2. On arrival at Select, **every video is already ticked**. The user unticks what they do not want. (Alternative: none ticked.)
3. Download ignores nothing silently: if the panel has **unsaved changes**, Download is blocked with a message (Options spec, section 4.3). (Alternative: download with the last applied settings.)
4. After a successful Download the user goes to `/downloads`.
5. Selecting a row on Options does not load its settings into the panel (prototype behaviour).
6. Selection on Options means both "Apply to these" and "download these" (prototype: the Download label counts the selected rows).
7. **(rev 4)** The options panel offers one video's own options when exactly one row is the target, and the main catalog otherwise. The per-video fallback of a chosen quality is backend work (`Down4More-Per-Video-Options-Spec.md`).
