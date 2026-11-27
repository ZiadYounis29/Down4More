# Down4More: Per-Video Available Options (addendum, rev 2)

> **Scope:** what the options panel offers when videos have different available options. Touches `core/models/media-item.model.ts`, `core/utils/apply-option-rules.ts`, `core/mocks/mock-data.ts`, `core/services/mock-api.service.ts`, `features/playlist/services/playlist-state.service.ts`, the Options page, and the Single page.
> **Priority:** like the Decisions spec, **this file wins** over the Flow, Options and Decisions specs where they conflict (section 6).
> **Decisions made (confirmed):**
> 1. When a narrower video clamps the panel's choice, it **stays clamped** when that video is unticked again.
> 2. With **several** videos selected the panel shows the **predefined main options** (not an intersection). Each video then falls back to the nearest lower quality it has.
> 3. **The fallback is backend work.** The frontend never resolves a choice per video. It sends what the user chose, and the backend (the mock, for now) decides what each video really gets.
> 4. No hint text is needed, because the lists no longer shrink.

---

## 0. The rule in one minute

Every video may carry its own `catalog` (the qualities, formats and bit-rates it really has).

| Target rows (the ticked rows, or all chosen in Global) | The panel offers |
|---|---|
| Exactly **one** video | that video's own `catalog` (or the fallback if it has none) |
| **Two or more** videos | the **predefined main catalog**: `FetchResult.catalog` |

The user picks one set of options. **Apply** stamps it on every target row exactly as picked. **Download** sends it. If a video does not have the chosen quality, **the backend** gives it the nearest lower one. The frontend does nothing special per video.

---

## 1. Model

```ts
// media-item.model.ts: add one optional field
export interface MediaItem {
  /* ...existing fields... */
  /** Options actually available for THIS video. Missing = use FetchResult.catalog. */
  catalog?: DownloadOptionsCatalog;
}
```

`FetchResult.catalog` stays and becomes the **predefined main catalog** (shown for multi-select) and the fallback for videos without their own `catalog`.

**Contract note (a comment on `ApiService.startDownloads`, no type change):** each `DownloadRequest.settings` is what the user *asked for*. For every video the backend must resolve it against that video's real options (quality: nearest lower available, else the lowest one above; bit-rate: nearest; format: first valid for the mode) and return the **resolved** settings in `DownloadItem.settings`.

---

## 2. Frontend pieces

### 2.1 `PlaylistStateService` (amends Flow spec section 4)

```ts
readonly catalog = computed(() => this.result().catalog);          // the predefined main catalog

catalogFor(item: MediaItem): DownloadOptionsCatalog { return item.catalog ?? this.catalog(); }

/** What the options panel offers. */
readonly effectiveCatalog = computed(() => {
  const rows = this.targetItems();
  return rows.length === 1 ? this.catalogFor(rows[0]) : this.catalog();
});

private defaultsFor(item: MediaItem): DownloadSettings {          // replaces the single `defaults` computed
  return defaultDownloadSettings(this.catalogFor(item));
}

settingsFor(id: string): DownloadSettings {
  const item = this.items().find(i => i.id === id)!;
  return this.applied()[id] ?? this.defaultsFor(item);
}

sizeFor(id: string): number | null {                               // baseline = THAT video's defaults
  const item = this.chosenItems().find(i => i.id === id);
  if (!item) return null;
  const applied = this.applied()[id];
  return applied ? estimateSizeBytes(item.sizeBytes ?? null, applied, this.defaultsFor(item))
                 : item.sizeBytes ?? null;
}
```

- `apply()` and `requests()` are **unchanged**: they stamp and send the draft as picked. No per-video resolving.
- `draft` and `appliedDraft` still start from `defaultDownloadSettings(result.catalog)`.
- The row tag and the size estimate show what was **requested**. The backend may give a video a lower quality, and the Downloads page then shows the resolved settings (from `DownloadItem.settings`).

### 2.2 Keeping the panel valid when its catalog changes

The panel is a set of selects, so its value must always exist in the list it shows. `applyOptionRules` already snaps a stale bit-rate to the nearest available (Decisions 1.3). Add the same for quality, **for the panel only** (P3 T2):

- If `quality` is not in `catalog.qualities`: use the **nearest lower** quality in the list. If none is lower, use the lowest one above. Qualities compare by their number (`'2160p'` gives 2160). If a quality has no number, take the first in the list.
- When the user selects one narrower video, the draft is clamped by the wrapper's existing "normalise on new catalog" effect. It **stays** clamped after unticking (decision 1).
- A clamp changes `draft`, so `dirty` can turn true without the user touching the panel. That is correct: the panel no longer matches what was last applied.

```ts
// core/utils/fallback-quality.ts (pure, with a .spec.ts)
export function fallbackQuality(wanted: string, available: string[]): string | null {
  if (available.length === 0) return null;
  if (available.includes(wanted)) return wanted;
  const rank = (q: string) => parseInt(q, 10);
  const w = rank(wanted);
  if (Number.isNaN(w)) return available[0];
  const lower = available.filter(q => rank(q) < w).sort((a, b) => rank(b) - rank(a));
  if (lower.length) return lower[0];
  return available.slice().sort((a, b) => rank(a) - rank(b))[0];
}
```

### 2.3 Options page (amends Options spec section 3)

```html
<d4m-download-options layout="contents" [(settings)]="state.draft" [catalog]="state.effectiveCatalog()" />
```

Nothing else changes: Apply is never disabled for this reason, and there is no extra status text.

### 2.4 Single page (amends Single spec section 6)

```ts
protected readonly catalog = computed(() => this.item().catalog ?? this.result().catalog);
```

`defaultDownloadSettings(this.catalog())` and the live `estimatedSize` (Decisions 2.5) use it.

---

## 3. The fallback in the mock (this is the "backend" part)

`MockApiService.startDownloads` (P4 T3) resolves each request against its item's catalog before creating the `DownloadItem`:

```ts
const catalog = request.item.catalog ?? MOCK_CATALOG;
const s = request.settings;
const resolved: DownloadSettings = {
  ...s,
  quality: s.quality == null ? null : fallbackQuality(s.quality, catalog.qualities),
  bitrate: s.bitrate == null ? null : nearestBitrate(s.bitrate, catalog.bitrates),
  format:  /* in the right format list for the mode ? keep : first of that list */,
};
// DownloadItem.settings = resolved
```

The mock may import `fallbackQuality` and `nearestBitrate` from `@core/utils`. A real backend implements the same rule itself.

**Mock data** (`MOCK_PLAYLIST_ITEMS`, amends Mock API spec 4.2). Add `catalog` to **three** items only:

| Item | `catalog` |
|---|---|
| p-4 "Lo-fi study mix, 2 hours" | qualities `1080p 720p 480p 360p`; bit-rates `96 128 160 192` |
| p-8 "Keyboard sound test" | qualities `1080p 720p 480p 360p` |
| p-9 "Documentary: the Nile delta" | video formats `mp4 mkv`; bit-rates `128 192 256` |

Everything else (the other items, `MOCK_MEDIA_ITEMS`, `generatePlaylistItems(300)`) has no `catalog` and uses `MOCK_CATALOG`. Global defaults stay 1080p and 192 kbps, so existing tests hold. To try it: tick p-4 and p-5, pick 2160p, Apply, Download. The Downloads page shows p-5 at 2160p and p-4 at 1080p.

---

## 4. What this replaces

| Where | Old | New |
|---|---|---|
| Flow spec 4 | one `defaults` computed; `catalog` fed the panel | `defaultsFor(item)`; `effectiveCatalog` feeds the panel |
| Options spec 3 | `[catalog]="state.catalog()"` | `[catalog]="state.effectiveCatalog()"` |
| Decisions 2.3 `sizeFor` | baseline `this.defaults()` | baseline `defaultsFor(item)` |
| Decisions 1.3 | clamp bit-rate only | clamp bit-rate **and quality** (2.2) |

---

## 5. Done when

- [ ] One ticked video: the panel offers exactly that video's qualities, formats and bit-rates.
- [ ] Two or more ticked, or Global with several chosen: the panel offers the predefined main catalog.
- [ ] After clamping by a narrower video, unticking it leaves the choice clamped (no restore).
- [ ] Apply and Download send the draft as picked. No per-video resolving in the frontend.
- [ ] In the mock, a video without the chosen quality downloads at the nearest lower one, and Downloads shows the resolved settings.
- [ ] An un-applied row's default and size baseline come from its own catalog.
- [ ] A video without `catalog` behaves exactly as before.
- [ ] Single uses the item's catalog.
- [ ] Tests pass: `fallbackQuality` (exact, nearest lower, none lower, no numbers, empty); `applyOptionRules` quality clamp; `effectiveCatalog` for one row, several rows and Global; mock `startDownloads` resolving quality, bit-rate and format.

---

## 6. Assumptions you can change

1. **"Predefined main options" means `FetchResult.catalog`.** A real backend would return a standard list there. If you want a fixed app-wide constant instead, replace `this.catalog()` in `effectiveCatalog`.
2. **Global with exactly one chosen video** counts as one video, so it shows that video's own catalog.
3. **The row tag and size show the requested settings,** not the resolved ones, because resolving is backend work. The only place the resolved quality appears is Downloads.
4. **Bit-rate falls back to the nearest value,** not "lower first" (it keeps Decisions 1.3). Only quality is lower-first.
5. **Quality compares by number.** A catalog with non-numeric qualities (for example "best") gets the first list entry.
