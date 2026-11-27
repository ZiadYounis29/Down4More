# Down4More: Download Options — Resolved Decisions (Bit-rate & Size Estimate)

> **Scope:** closes two of the shared spec's open decisions (§10.4 "Bitrate control" and §10.6 "Size estimates"). Touches `core/models/download-settings.model.ts`, `shared/components/download-options/bitrate/`, `core/utils/apply-option-rules.ts`, `core/utils/default-download-settings.ts`, `core/mocks/mock-data.ts` (amends `Down4More-Mock-Api-Service-Spec.md` §4.2), and `features/playlist/services/playlist-state.service.ts` (amends `Down4More-Playlist-Flow-Spec.md` §4).
> **Decisions this spec implements (confirmed):**
> 1. Bit-rate is **fixed values gathered from the fetch** — what's actually available for that media — not a free number input.
> 2. The Playlist Options page **re-estimates file size** when quality, format or mode changes (on Apply).
> **Backend:** none. This defines exactly what the mock must do for both; the real backend's `fetchInfo` must eventually return genuine per-video available bitrates and genuine size estimates in the same shapes.
> **(rev 4)** `Down4More-Per-Video-Options-Spec.md` extends this spec: the catalog can be per video, `applyOptionRules` also clamps quality, and the size baseline in 2.3 is `defaultsFor(item)`.

---

## 1. Bit-rate becomes a fixed, fetched list

### 1.1 Model change

```ts
// download-settings.model.ts
export interface DownloadOptionsCatalog {
  qualities: string[];
  videoFormats: string[];
  audioFormats: string[];
  bitrates: number[];          // was { min, max, step } — now the exact kbps values actually available, ascending
}
```

`DownloadSettings.bitrate` (`number | null`) is unchanged — it's still just "the chosen kbps, or `null` when the mode has no audio component." What changes is that its value must now always come **from** `catalog.bitrates`, never be freely typed.

### 1.2 Component change: `d4m-bitrate` becomes a select, not a number input

Shared spec §4.6.3 described bit-rate as "input in `d4m-bitrate`." That's no longer accurate — it's a labelled `d4m-select` exactly like quality and format (§5's uniform `value / options / disabled / label` API already supports this with zero new primitive work, since `d4m-select` already exists). Options are `catalog.bitrates` formatted as `"96 kbps"`, `"128 kbps"`, etc. Visually it sits in the same grid cell it always did (Options page spec §2.1, `bitrate` cell); only the control type changes.

### 1.3 `applyOptionRules` (shared spec §6.4)

No change to the mode-dependency table itself (video+audio/audio-only enable bit-rate, video-only disables it). The one addition: when **mode switches away from and back to** a bitrate-enabled mode, or when a **new catalog arrives**, the selected bitrate must be a value that actually exists in `catalog.bitrates` — clamp to the **nearest available value** rather than leaving a stale number that's no longer offered:

```ts
function nearestBitrate(wanted: number, available: number[]): number {
  return available.reduce((best, v) => Math.abs(v - wanted) < Math.abs(best - wanted) ? v : best);
}
```

### 1.4 `defaultDownloadSettings` and the mock catalog

```ts
// core/mocks/mock-data.ts — amends Mock API Service Spec §4.2
export const MOCK_CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],   // kbps, ascending — "what's actually available for this video"
};

// core/utils/default-download-settings.ts
export function defaultDownloadSettings(catalog: DownloadOptionsCatalog): DownloadSettings {
  return {
    mode: 'video+audio',
    quality: catalog.qualities.includes('1080p') ? '1080p' : catalog.qualities[0],
    format: catalog.videoFormats[0],             // 'mp4'
    bitrate: 192,                                 // was 300 (not a real value in any bitrate list); 192 kbps is the closest
    captions: { enabled: false, separateFile: false },
  };
}
```

**Choice you can change:** the prototype's original default was `300`, which was never a value the fixed list could contain. `192` is picked as a reasonable mid-tier default; swap it for whichever value your real yt-dlp integration tends to surface most often once that exists.

---

## 2. Size re-estimation on Apply

### 2.1 The approach: scale the existing fetch estimate, don't recompute from scratch

A naive "video-bitrate × duration" formula produces numbers wildly inconsistent with what `fetchInfo` already showed on Home/Select (its mock sizes are flavor numbers, not bitrate-accurate). Instead, **`item.sizeBytes` from `fetchInfo` is treated as the anchor** — the size *at the catalog's default settings* — and re-estimating means scaling that anchor by how far the new settings are from the default, not computing size independently. This keeps rows internally consistent (no size jumping from "40 MB" to "800 MB" just because Apply was pressed with the same settings) and, as a side effect, **needs no `durationSec`**, so it works even for items with unknown duration.

```ts
// core/utils/estimate-size.ts
const AUDIO_SHARE = 0.08;   // assumed fraction of a video+audio file's size that is audio, at the default bitrate

const QUALITY_FACTOR: Record<string, number> = {   // relative to 1080p = 1.0
  '2160p': 4.0, '1440p': 2.0, '1080p': 1.0, '720p': 0.55, '480p': 0.3, '360p': 0.15,
};

/** baselineBytes: item.sizeBytes as fetched (assumed to be at `baselineSettings`, i.e. the catalog defaults).
 *  Returns null when baselineBytes is null (nothing to scale from) — format/quality/bitrate are otherwise ignored for an unknown size, same as the rest of the app shows '—'. */
export function estimateSizeBytes(
  baselineBytes: number | null,
  settings: DownloadSettings,
  baselineSettings: DownloadSettings,
): number | null {
  if (baselineBytes == null) return null;

  const quality = QUALITY_FACTOR[settings.quality ?? ''] ?? 1.0;
  const defaultBitrate = baselineSettings.bitrate ?? 192;
  const audioFactor = (settings.bitrate ?? defaultBitrate) / defaultBitrate;

  const scale =
    settings.mode === 'audio-only' ? AUDIO_SHARE * audioFactor :
    settings.mode === 'video-only'  ? (1 - AUDIO_SHARE) * quality :
    /* video+audio */                 (1 - AUDIO_SHARE) * quality + AUDIO_SHARE * audioFactor;

  return Math.round(baselineBytes * scale);
}
```

**Format is intentionally ignored** (mp4/mkv/webm are treated as same-size) — a deliberate simplification, called out in §4 below.

### 2.2 Worked example

"Rocket landing, full broadcast" — `sizeBytes: 41943040` (40 MB) at the catalog default (video+audio, 1080p, 192 kbps).

| Applied settings | Factor | Estimated size |
|---|---|---|
| 1080p, video+audio, 192 kbps (unchanged — same as default) | `0.92×1.0 + 0.08×1.0 = 1.0` | 40 MB (unchanged) |
| 720p, video+audio, 192 kbps | `0.92×0.55 + 0.08×1.0 = 0.586` | ≈ 23.4 MB |
| 2160p, video-only | `0.92×4.0 = 3.68` | ≈ 147.2 MB |
| audio-only, 320 kbps | `0.08×(320/192) = 0.133` | ≈ 5.3 MB |

Numbers stay in a believable range relative to what the user already saw on Select, instead of jumping to an unrelated absolute figure.

### 2.3 `PlaylistStateService` changes (amends Flow spec §4)

```ts
sizeFor(id: string): number | null {
  const item = this.chosenItems().find(i => i.id === id);
  if (!item) return null;
  const applied = this.applied()[id];
  if (!applied) return item.sizeBytes ?? null;              // never applied: show the original fetch estimate, unchanged
  return estimateSizeBytes(item.sizeBytes ?? null, applied, this.defaultsFor(item));   // (rev 4) was this.defaults()
}
```

**(rev 4)** `this.defaults` is replaced by `defaultsFor(item)` (`defaultDownloadSettings(this.catalogFor(item))`), so each video's size baseline is its own default (`Down4More-Per-Video-Options-Spec.md` 2.1).

**`summary` (Flow spec §4) now reads through `sizeFor`, not `r.sizeBytes` directly:**

```ts
readonly summary = computed(() => {
  const rows = this.targetItems();
  const known = rows.map(r => this.sizeFor(r.id)).filter((b): b is number => b != null);
  const size = known.length ? ` · ${formatSize(known.reduce((a, b) => a + b, 0))}` : '';
  const n = rows.length;
  return this.isGlobal()
    ? `Global · ${n} ${n === 1 ? 'video' : 'videos'}${size}`
    : `${n} of ${this.chosenItems().length} selected${size}`;
});
```

### 2.4 Row display (amends Options page spec §2, "Row")

`d4m-media-thumbnail` gains an optional input, on **both** the `option-select` and `single` variants (not just `option-select` — see §2.6), so it doesn't need a mutated copy of `MediaItem`:

```ts
sizeOverride = input<number | null | undefined>(undefined);   // when set, used instead of item().sizeBytes
```

```html
<!-- playlist-options.component.html, inside the row template -->
<d4m-media-thumbnail variant="option-select" [item]="item" [sizeOverride]="state.sizeFor(item.id)" ... />
```

Default (un-applied) rows pass through to `item.sizeBytes` exactly as before — nothing changes for them. Only rows with a stamped `applied` entry show a recalculated number.

### 2.5 Single page: the estimate updates live, not on an "Apply"

The Single Page Spec (§6, "⚙ Backend later") flags exactly this gap itself: *"A live file-size estimate (the '40 mbs' in `info`) would update `item().sizeBytes`, and `d4m-media-thumbnail` re-renders."* It leaves this to "backend later" — but the estimate doesn't need a backend, it only needs §2.1's formula, so there's no reason to defer it.

Single has no Apply step — `settings` is one live signal, not a draft/applied pair — so the size estimate there is simpler than on Options: just a `computed()` that recalculates on every settings change, always.

```ts
// single.component.ts — add alongside the existing `settings` signal
protected readonly estimatedSize = computed(() =>
  estimateSizeBytes(this.item().sizeBytes ?? null, this.settings(), defaultDownloadSettings(this.catalog())),
);
```

```html
<!-- single.component.html -->
<d4m-media-thumbnail class="a-info" variant="single" [item]="item()" [sizeOverride]="estimatedSize()" />
```

Unlike Options, there's no "un-applied, show the original" branch to worry about — Single always shows the estimate for whatever `settings()` currently holds, live, the moment the user touches quality, format, mode or bit-rate. The very first render (before any change) computes against the catalog defaults, which is exactly `baselineSettings`, so `estimateSizeBytes` returns the original `item.sizeBytes` unchanged — the number on first paint matches what Home/Single already showed, same as the Options page's "never applied" rows.

### 2.6 Summary: §2.1–§2.3's formula is page-agnostic

Nothing in `estimateSizeBytes` (§2.1) is Options-specific — it only takes a baseline size, a settings object, and a baseline-settings object. §2.4's `sizeOverride` input and §2.5's direct `computed()` are just two different callers of the same pure function: Options calls it per-row, keyed by `applied` state; Single calls it once, keyed by its one live `settings` signal. No second formula, no second spec needed.

---

## 3. Done when

- [ ] `d4m-bitrate` renders as a select populated from `catalog.bitrates`, never a free-typed number, in both the Single and Playlist Options panels.
- [ ] Switching mode never leaves an invalid bitrate selected; it snaps to the nearest value in `catalog.bitrates` (§1.3).
- [ ] An un-applied row's size equals exactly what Select/Home already showed for that item.
- [ ] Applying new settings to a row changes its displayed size per §2.1's formula, and the change is proportionate (never absurdly larger/smaller than the original).
- [ ] The Options page summary total recomputes to match the sum of currently-displayed row sizes, including a mix of applied and un-applied rows.
- [ ] An item with `sizeBytes: null` always shows `—`, regardless of what settings are applied to it.
- [ ] `estimateSizeBytes` has unit tests covering all three modes and at least one quality/bitrate combination each.

---

## 4. Choices made that you can change

1. **Format (mp4/mkv/webm) does not affect the estimate.** Real container/codec choices do change file size somewhat; this was dropped for simplicity. Add a small per-format multiplier (e.g. `webm: 0.9`) if you want it to matter.
2. **`AUDIO_SHARE = 0.08`** and the quality-factor table (§2.1) are invented constants tuned only to keep mock numbers plausible, not derived from real encode data. Tune freely; nothing else depends on their exact values.
3. **Estimate updates only on Apply**, not live as the draft panel changes (matching how "Unsaved changes" already gates everything else on this page). If you want a live preview before Apply, `sizeFor` would need a second mode that reads `draft` instead of `applied`, shown only for ticked/target rows.
4. **Default bitrate changed from the prototype's `300` to `192`** (§1.4), since `300` was never a value a fixed list could offer. Revisit once the real backend defines what "available bitrates" typically looks like.
5. ~~This spec scopes the size re-estimate to the Playlist Options page only... if the still-missing Single page spec also shows an estimated size, apply it there too.~~ **Resolved:** the Single Page Spec has since arrived and does show a size estimate (`info` block). §2.5 above wires it up — same formula, live instead of apply-gated, since Single has no draft/applied distinction to begin with.
