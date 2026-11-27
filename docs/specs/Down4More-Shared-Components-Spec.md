# Down4More: Frontend Specs, Shared Components

> **Scope:** `src/app/shared/` only. Pages (features) get their own spec next.
> **Backend:** not ready. Everything is built against a mock, with one swap point (see section 2).
> **Revision 2 (27 Nov 2026):** section 4 rewritten from the real design files (light + dark themes, every button, every shared control). Row height, page widths, `item-container` (now shows a set number of rows), captions, `media-thumbnail` and `download-info` `big` were updated to match. Changes are marked **(rev 2)**. This file covers shared components only. Page-specific details live in the page specs.
> **Revision 3 (27 Nov 2026):** consolidation. Applies every pending "changes to other specs" list (Playlist Flow section 7, Downloads section 9, History section 9, Core nav-bar), renames pre-fetch / post-fetch to **select / options**, fixes the small contradictions found in the check, and adds the **compact layout for the list + side pages** (4.4, 4.6.10, 6.1, 6.3, 6.6, 6.7). Changes are marked **(rev 3)**.
> **Assumed stack:** Angular 19+ (standalone by default, signal inputs, `@if` / `@for`). On Angular 17.2 to 18, add `standalone: true` explicitly. Nothing else changes.
> **(rev 4)** `Down4More-Per-Video-Options-Spec.md` adds an optional `MediaItem.catalog` (section 3), a quality clamp in `applyOptionRules` (6.4) and `[catalog]="state.effectiveCatalog()"` on the Options page (6.4 usage).
> **(rev 5)** Trim look values are now in `Down4More-Single-Page-Style-Notes.md`. Two small changes follow from it: the dark switch knob is `left: 21px` when on (4.6.5), and the Add segment button has a dark look (4.5 row 10).

---

## 0. How to use this document

- Hand each teammate **sections 1 to 5** (rules, contracts, tokens, primitives) plus **the one component section** they build in section 6. Each component section is self-contained.
- Anything marked **Decision needed** is collected in section 10. Settle those before work starts.
- A component is done only when it passes the checklist in section 9.
- Lines marked **⚙ Backend later** say exactly what changes when the real backend arrives. Usually the answer is "nothing in this component".

---

## 1. Global rules (apply to every shared component)

| # | Rule |
|---|---|
| 1 | **Dumb components.** Data in through `input()`, events out through `output()`. No HTTP, no `Router`, no feature services, no global stores inside `shared/`. |
| 2 | **Pages decide, shared components display.** A shared component never navigates and never calls the backend. It emits an event and the page handles it. This is what lets the same component work for single, playlist, downloads and history. |
| 3 | **Standalone + OnPush.** `changeDetection: ChangeDetectionStrategy.OnPush`. Use signals (`input`, `model`, `output`, `computed`). No `any`. |
| 4 | **Selector prefix `d4m-`.** Example: `d4m-nav-buttons`. Folder and file names are kebab-case: `nav-buttons.component.ts`. |
| 5 | **Variants are string-literal unions**, never booleans that multiply (`variant="small"`, not `isSmall`). |
| 6 | **Extension points are content projection or config objects**, not extra inputs per use case. |
| 7 | **Styling only through design tokens** (section 4). No hard-coded colours, radii or shadows in component SCSS. Both themes must work with no per-theme code inside a component (section 4). |
| 8 | **Allowed imports in `shared/`:** `core/models`, `core/utils`, other `shared/` components. **Forbidden:** `core/services`, anything from `features/`. |
| 9 | **Each component folder has an `index.ts` barrel** exporting the component and its public types. Import via path aliases: `@core/*`, `@shared/*`, `@features/*` (configure in `tsconfig.json`). |
| 10 | **Accessibility baseline:** real `<button>` / `<input>` elements, visible focus ring, `aria-label` on icon-only buttons, never colour alone to show status (add icon or text). |
| 11 | **Every component handles:** empty, loading and long-text states (see its section). |
| 12 | **File set per component:** `.ts`, `.html`, `.scss`, `.spec.ts`, `index.ts`. Templates and styles are external files. |

---

## 2. Backend-agnostic design

### 2.1 One swap point

```ts
// core/services/api.service.ts  (abstract class = the contract)
export abstract class ApiService {
  abstract fetchInfo(urls: string[]): Observable<FetchResult>;
  abstract startDownloads(requests: DownloadRequest[]): Observable<void>;
  abstract downloads$(): Observable<DownloadItem[]>;          // live progress stream. Must include every download of the session, finished and failed too (the Downloads pills count them)
  abstract control(action: DownloadAction, ids: string[]): Observable<void>;
  abstract history(query?: string): Observable<DownloadItem[]>;
}

// app.config.ts  (today)
{ provide: ApiService, useClass: MockApiService }
// later: ElectronApiService or HttpApiService. This one line is the only change.
```

Feature services (`download.service`, `history.service`, ...) call `ApiService`. Shared components never see any of it.

### 2.2 Single vs batch: the answer

Make the backend contract **batch-first**. A single download is a batch of one.

```ts
startDownloads([ { item, settings, extras } ])             // single
startDownloads(selectedItems.map(toRequest))               // playlist / batch
```

So **the same Download button, the same `download-options`, the same item rows are used everywhere**. The only things that differ between single and batch are:

1. which **page handler** runs when the button is pressed
2. whether the **array has 1 or N entries**

That is the only place where single and batch differ in code. Section 7 lists the exact handler per page.

### 2.3 What is real data and what is not

| Data | Comes from | Until backend exists |
|---|---|---|
| Video info (title, thumbnail, duration, channel) | `fetchInfo()` | `MOCK_MEDIA_ITEMS` |
| Available qualities / formats / bitrate range | `fetchInfo()` | `MOCK_CATALOG` |
| File size (depends on chosen settings) | backend estimate | fixed mock numbers |
| Progress, speed, ETA | `downloads$()` stream | `MockApiService` ticks every second |
| Pause / resume / cancel / retry | `control()` | mock changes state locally |

---

## 3. Shared data contracts (`core/models/`)

These are the only types shared components may depend on. Do not change them without telling the team.

```ts
// download-settings.model.ts
export type MediaMode = 'video+audio' | 'audio-only' | 'video-only';

export interface CaptionSettings {
  enabled: boolean;
  separateFile: boolean;
}

export interface DownloadSettings {
  mode: MediaMode;
  quality: string | null;     // '1080p'. null when mode = 'audio-only'
  format: string;             // 'mp4' | 'mkv' | 'mp3' ...
  bitrate: number | null;     // kbps. null when mode = 'video-only'
  captions: CaptionSettings;
}

export interface DownloadOptionsCatalog {      // what the user may pick for this media
  qualities: string[];                         // ['2160p','1080p','720p',...]
  videoFormats: string[];                      // ['mp4','mkv','webm']
  audioFormats: string[];                      // ['mp3','m4a','opus']
  bitrate: { min: number; max: number; step: number };   // kbps
}

// media-item.model.ts
export interface MediaItem {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string | null;
  durationSec: number | null;                  // null = unknown / live
  channelName?: string;
  sizeBytes?: number | null;                   // estimate, changes with settings
  catalog?: DownloadOptionsCatalog;            // (rev 4) options THIS video really has; missing = FetchResult.catalog
}

// download-item.model.ts
export type DownloadStatus =
  'queued' | 'downloading' | 'paused' | 'processing' | 'done' | 'failed';

export interface DownloadItem extends MediaItem {
  status: DownloadStatus;
  progress: number;                            // 0..100
  downloadedBytes: number;
  totalBytes: number | null;
  speedBps: number | null;
  etaSec: number | null;
  settings: DownloadSettings;                  // what it was started with
  priority: number;
  error?: string;
  startedAt?: string;                          // ISO date
  finishedAt?: string;                         // ISO date, set when done/failed
}

export type DownloadAction = 'pause' | 'resume' | 'cancel' | 'retry' | 'remove' | 'prioritize' | 'dismiss';
// (rev 3) dismiss = hide from Downloads, keep the history record. remove = delete the history record (History page only)
export interface DownloadActionEvent { type: DownloadAction; id: string; }

// history-entry.model.ts
export type HistoryEntry = DownloadItem & { finishedAt: string };   // status is 'done' | 'failed'

// download-request.model.ts: what the Download button ultimately sends
export interface DownloadRequest {
  item: MediaItem;
  settings: DownloadSettings;
  extras?: SingleExtras;                       // defined in Down4More-Single-Page-Spec.md (file name, trim, frame size)
}
export interface SingleExtras { fileName: string; trim?: TrimSegment[] | null; frameSize?: FrameSizeSettings | null; }   // full shape in the Single page spec
```

**Naming note:** the UI says "Succeeded" for history, the model says `done`. Map in the template, do not add a second status.

**Pure helpers** (in `core/utils/`, unit-tested, no Angular):

```ts
defaultDownloadSettings(catalog): DownloadSettings
applyOptionRules(settings, catalog): DownloadSettings   // see 6.4, the mode dependency rules
formatDuration(sec: number | null): string              // 3725 -> '1:02:05', null -> '—'
formatSize(bytes: number | null, unit: 'auto' | 'mb' = 'auto'): string   // 41943040 -> '40 MB', null -> '—'. 'auto': 1.1 GB from 1 GB. 'mb': '1,120 MB' (Downloads progress). Tables in the History spec 3.3
formatSpeed(bps) / formatEta(sec)                       // '17.2 MB/s' / '40 hrs'
formatWhen(iso: string, now?: Date): string             // (rev 3) 'Today, 14:32' / 'Yesterday' / 'Mon 23 Nov' / '23 Nov 2025'. History spec 3.2
```
`formatDuration` and `formatSize` are also exported as standalone pipes `duration` and `fileSize` for templates.

---

## 4. Design tokens, themes and style reference

> **Source of truth for looks:** `Down4More-light.html` (Home), the Download options boards (Single, light + dark), the Batch options page and the Downloads page. The existing front-end *code* is not reused, only how things look. Where this section says "mock name" it is the short CSS variable used in those files.
> Every value below was read from those files. Small inconsistencies between them were accidents and are resolved here: filled panels everywhere, one card padding per layout, a readable Apply label, captions enabled in every mode.

### 4.1 Theme mechanism

- Two themes: **light** and **dark**. Both are fully designed.
- The theme is the attribute `data-theme="light|dark"` on `<html>`. With no attribute, follow `prefers-color-scheme`.
- Tokens live in `styles.scss`: `:root, :root[data-theme="light"] { ... }` and `:root[data-theme="dark"] { ... }`.
- A `ThemeService` (in `core`, specified in `Down4More-Core-Shell-Spec.md`) holds the theme. **Only `nav-bar` uses it** (the moon / sun icon button, see 4.6.12). Shared components never read the theme. They only use tokens, so they work in both themes for free.

### 4.2 Colour tokens

| Token | Mock | Light | Dark | Use |
|---|---|---|---|---|
| `--color-bg` | `--bg` | `#FDF0F0` | `#111418` | page background, and the fill of panels and list rows |
| `--color-surface` | `--bx` | `#FFFFFF` | `#1A1F26` | the big page card, thumbnail boxes |
| `--color-text` | `--ink` | `#3B1620` | `#E6EAF0` | main text |
| `--color-text-muted` | `--mu` | `#7A4A55` | `#9AA5B4` | labels, meta text, unchecked checkbox border |
| `--color-primary` | `--b` | `#7A1F3D` | `#5EC8FF` | active nav link, selected state, outlines (light), progress fill |
| `--color-primary-dark` | `--bs` | `#491325` | `#387899` | logo shade, scroll-thumb shade |
| `--color-accent` | `--r` | `#D51423` | `#FF5C6C` | brand red, focus ring, "Unsaved changes", failed dot, applied tag |
| `--color-accent-dark` | `--rs` | `#8a0d17` | `#a63c46` | logo shade, scroll-thumb while dragging |
| `--color-action-bg` | `--fb` | `#D51423` | `#FF5C6C` | main action button fill (Fetch, Download) |
| `--color-action-fg` | `--ff` | `#FFFFFF` | `#1E0508` | text on the small action button (Fetch) and on the applied tag |
| `--color-on-big-action` | `--bt` | `#FFFFFF` | `#000000` | text on the big Download and Apply buttons |
| `--color-apply` | `--ap` | `#F2B705` | `#FFD84D` | Apply button fill, "downloading" dot |
| `--color-apply-fg` | `--apf` | `#2B1D00` | `#2B1D00` | text on the Apply button (both themes) |
| `--color-success` | `--ok` | `#1E7F4F` | `#5FD38D` | "Done" dot, history "Succeeded" |
| `--color-warning` | alias | `= --color-apply` | `= --color-apply` | processing / paused / downloading |
| `--color-danger` | `--xc` | `#A50D1A` | `#FF8C97` | remove (x) on Home, cancel icon |
| `--color-border` | `--ln` | `#F0D3D6` | `#43484E` | dividers, dashed row lines, tag fill, progress track |
| `--color-selected` | `--sel` | `rgba(122,31,61,.07)` | `rgba(94,200,255,.09)` | tint laid over a selected row |
| `--shadow-card` | `--sh` | `0 20px 50px rgba(22,51,95,.12)` | `0 20px 50px rgba(0,0,0,.45)` | page card |
| `--color-history-ok` **(rev 3)** | | `#2A8A55` | `#1F7347` | History: succeeded row fill, chip text |
| `--color-history-ok-border` **(rev 3)** | | `#2A8A55` | `#2F8F5E` | History: succeeded row border |
| `--color-history-ok-label` **(rev 3)** | | `#D9F2E4` | `#CDEBDA` | History: date, meta labels, dividers on a green row |
| `--color-history-err` **(rev 3)** | | `#CC3A4B` | `#B02D3E` | History: failed row fill, chip text |
| `--color-history-err-border` **(rev 3)** | | `#CC3A4B` | `#C84557` | History: failed row border |
| `--color-history-err-label` **(rev 3)** | | `#FADCE0` | `#F5CDD3` | History: same, on a red row |
| `--color-on-history` **(rev 3)** | | `#FFFFFF` | `#FFFFFF` | History: text, chip fill, icon buttons and focus ring on coloured rows |

Logo tokens (used only by `d4m-logo`, same in both themes): `--logo-primary: var(--color-primary)`, `--logo-primary-dark: var(--color-primary-dark)`, `--logo-accent: var(--color-accent)`, `--logo-accent-dark: var(--color-accent-dark)`.

### 4.3 Component tokens (light and dark are built differently)

Light uses **outlined, transparent** controls with a 2px primary border. Dark uses **filled** controls with a thin grey border. The component SCSS uses only these tokens, so one rule serves both themes.

| Token | Mock | Light | Dark | Used by |
|---|---|---|---|---|
| `--field-border` | `--fbd` | `2px solid #7A1F3D` | `1px solid #43484E` | select, text input |
| `--field-bg` | `--fbg` | `transparent` | `#1A1F26` | select, text input |
| `--pill-border` | `--pbd` | `2px solid #7A1F3D` | `2px solid #43484E` | mode pill, status pill |
| `--pill-bg` | `--pbg` | `transparent` | `#1A1F26` | mode pill, status pill |
| `--pill-text` | `--pc` | `#7A1F3D` | `#E6EAF0` | mode pill, status pill |
| `--box-border` | `--tbd` | `2px solid #7A1F3D` | `1px solid #43484E` | thumbnail box, icon buttons |
| `--box-bg` | `--tbg` | `transparent` | `#1A1F26` | icon buttons |
| `--box-fg` | `--tc` | `#7A1F3D` | `#9AA5B4` | icon inside thumbnail box and icon buttons |

### 4.4 Size, radius and type tokens

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `28px` | the big page card |
| `--radius-panel` | `18px` | panels (`d4m-panel`) and list rows |
| `--radius-big-btn` | `16px` | Download and Apply (large buttons) |
| `--radius-control` | `12px` | select, input, thumbnail box |
| `--radius-icon-btn` | `10px` | square icon buttons, nav links |
| `--radius-pill` | `999px` | pills, ghost and Fetch buttons, tags, progress bar |
| `--row-height` | `82px` | list row (**was 72 in revision 1**) |
| `--row-gap` | `10px` | space between list rows |
| `--control-height` | `42px` | select and input |
| `--font-body` | `Manrope, system-ui, sans-serif` | weights 500, 600, 700, 800, loaded once in `index.html` |

**Compact layout breakpoint (rev 2).** The app has **one** responsive breakpoint: **720px**. At 720px and narrower the app uses the **compact layout** (blocks stacked on top of each other). It is decided by **width only**, never by platform. So a narrow browser window, a tablet held upright and the Android app all get the same compact layout. The Single page's SVG calls it the "Android layout".

```scss
// styles/_breakpoints.scss
$bp-compact: 720px;
@mixin compact { @media (max-width: $bp-compact) { @content; } }   // usage: @include compact { ... }
```

Every component and page uses `@include compact` and never writes its own `720px`. Shared rules in the compact layout:

- the page shell padding is `16px 16px 32px` and the page card padding becomes `24px 16px` *(assumed)*;
- `layout="split"` is **one column**: `[main]` (the list) on top, `[side]` (options, status, details) **under it**, in DOM order, nothing hidden (6.1). This is the compact layout of Downloads and Playlist Options, the same idea as the Single page;
- list rows switch to the compact row (4.6.10) and the `item-container` header wraps (6.7);
- `d4m-nav-buttons fullWidth="compact"` fills its row (6.3).

**Two documented exceptions (rev 3).** Both are about content that does not fit, not about page layout. (1) `layout="split"` also stacks **above** 720px, automatically, when the card is too narrow for a 380px list next to a 340px panel (a viewport of about 900px, 6.1). (2) The History row hides its Format column under 860px (History spec 2.3). Nothing else may add a breakpoint. The nav bar used a 560px rule and now uses `@include compact` too.

**Type scale** (all Manrope):

| Role | Size / weight | Colour |
|---|---|---|
| Home title (h1) | 60 / 800, letter-spacing -.02em | text (wordmark: "Down" primary, "More" accent) |
| Home subtitle | 17 / 500 | muted |
| Brand text, Home URL input | 22 / 800, 20 / 500 | text |
| Nav link | 15 / 600 | text (active: `--color-bg` on primary) |
| Label (`.lab`) | 13 / 700 | muted |
| Value (`.val`) and row title | 15 / 700 | text |
| Field text, pill text | 15 / 600, 15 / 700 | field: text, pill: `--pill-text` |
| Ghost button text, count text ("1 of 7 selected") | 14 / 600 | text, muted |
| Tag, meta line (speed, size, ETA) | 12 / 700 | tag: text on border colour, meta: muted |
| Row percent | 13 / 800 | primary |
| Details-panel percent | 20 / 800 | primary |
| Small action button (Fetch) | 16 / 700 | `--color-action-fg` |
| Big buttons | 18 / 700 (Apply 17 / 700) | `--color-on-big-action` |

### 4.5 Buttons: complete catalogue

Every button in the designs, with exact values. All use `<button type="button">`, Manrope, and the states in 4.7. The global classes are written once in `styles.scss`; any component can use them with no import.

| # | Button (where used) | Class | Size | Radius | Fill | Border | Text / icon | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | **Download** (Single, Batch) | `.btn.btn--lg.btn--primary` | h **72**, padding 0 24, min-width 180. Full width in the Batch side panel | 16 | `--color-action-bg` | none | `--color-on-big-action`, 18/700, arrow-down icon 22, gap 8 | label can include a count: `Download (3)` |
| 2 | **Apply** (Batch) | `.btn.btn--lg.btn--apply` | h **72**, full width of its grid cell | 16 | `--color-apply` | none | `--color-apply-fg`, 17/700 | status text under it, 12/700 centred, h16: "Unsaved changes" in `--color-accent`, "Settings applied" in muted |
| 3 | **Fetch** (Home) | `.btn.btn--primary` | h **44**, padding 0 22 | pill | `--color-action-bg` | none | `--color-action-fg`, 16/700, arrow-down icon 20, gap 6 | |
| 4 | **Plus / add link** (Home) | `.btn.btn--circle` | **44 x 44** | circle | transparent | 2px `--color-primary` | `--color-primary`, plus icon 20 | |
| 5 | **Remove x** (Home URL rows) | `.btn.btn--danger` (icon only) | **44 x 44** | none | none | none | `--color-danger`, x, 16 | |
| 6 | **Ghost** (Global, Select all, Pause all, Priority) | `.btn.btn--sm.btn--ghost` | h **36**, padding 0 16 | pill | none | 1px `--color-border` | text, 14/600 | hover: border `--color-primary`. `aria-pressed="true"`: fill `--color-primary`, border `--color-primary`, text `--color-bg` |
| 7 | **Mode pill** (video+audio / audio only / video only) | `.pill` (inside `d4m-segmented-control`) | h **40**, padding 0 18 | pill | `--pill-bg` | `--pill-border` | `--pill-text`, 15/700 | selected (`aria-pressed="true"`): fill, border `--color-primary`, text `--color-bg`. Group: flex, gap 10, wrap, centred |
| 8 | **Status pill** (Downloads: Done / Downloading / Failed) | `.pill` + dot | h **40**, padding 0 14, gap 6, no wrap | pill | `--pill-bg` | `--pill-border` | same as mode pill + 10px round dot | dot colour: Done `--color-success`, Downloading `--color-apply`, Failed `--color-accent`. Group gap 8 |
| 9 | **Icon button** (theme toggle, pause, cancel) | `.btn--icon` | **38 x 38** (`sm`: **34 x 34**) | 10 | `--box-bg` | `--box-border` | `--box-fg`, icon 18 (sm: 14) | cancel variant `.btn--icon.btn--danger`: icon in `--color-accent`. Pause icon is two filled bars, cancel is a stroked x (2.6) |
| 10 | **Add segment** (Single, Trim) | `.btn.btn--circle` (size 40) | **40 x 40** | circle | light: transparent. Dark: `--color-surface` | light: 2px `--color-primary`. Dark: 2px `--color-border` | light: `--color-primary`. Dark: `--color-text`. Plus icon 18 | aligned bottom-right of its list. Uses the `--trim-add-*` tokens (Single Style Notes 6, rev 5) |
| 11 | **Nav link** (Downloads / History / Settings) | `.nl` (inside `nav-bar`) | padding 9px 16 | 10 | none | none | text, 15/600 | active (`.on`): fill `--color-primary`, text `--color-bg` |
| 12 | **Switch** (Frame Size, Trim Video) | `d4m-toggle` | track **46 x 26** | pill | see 4.6.5 | | label "Off" / "On" 14/700 muted | `role="switch"` |
| 13 | **Checkbox** (list rows) | `d4m-checkbox` | **22 x 22** | 7 | none | 2px `--color-text-muted` | check icon 14, stroke 3.2 | checked: fill and border `--color-primary`, check in `--color-bg` |

**Variants that exist as classes** (final list for `styles.scss`):

| Class | Meaning |
|---|---|
| `.btn` | base: inline-flex, centred, gap 6, bold, `cursor: pointer`, height 44, pill |
| `.btn--sm` | height 36, 14/600 (toolbar buttons) |
| `.btn--lg` | height 72, radius 16, 18/700 (Download, Apply) |
| `.btn--primary` | `--color-action-bg` / `--color-action-fg` (on `--lg`: text is `--color-on-big-action`). `.btn--apply` always uses `--color-apply-fg` |
| `.btn--apply` | `--color-apply` fill |
| `.btn--secondary` | outline in `--color-primary` (kept from revision 1, not in the designs yet) |
| `.btn--ghost` | transparent, 1px `--color-border`, hover border primary, pressed state as row 6 |
| `.btn--danger` | text or icon in `--color-danger` (on `--icon`: `--color-accent`) |
| `.btn--icon` | 38 square, radius 10, `--box-*` tokens (`.btn--icon.btn--sm` = 34) |
| `.btn--circle` | circle, 2px primary outline (44 on Home, 40 for add segment) |
| `.btn--block` | full width |
| `.btn--on-color` **(rev 3)** | used with `.btn--icon.btn--sm` on the coloured History rows: transparent fill, 2px solid `--color-on-history` border, icon in `--color-on-history`. Hover: fill `--color-on-history`, icon colour = the row's fill (`var(--row-bg)`) |

> **Apply label colour:** always `--color-apply-fg` (dark brown on amber, readable in both themes). White on amber would fail the accessibility baseline.

### 4.6 Shared controls and containers: look of each piece

Everything here is built from the tokens above. Dimensions are in px.

**4.6.1 Page card (`d4m-page-container`)**
Fill `--color-surface`, radius `--radius-card` (28), border 1px `--color-border`, shadow `--shadow-card`. Page shell (`app.component`): padding `20px 32px 48px`, fill `--color-bg`, text `--color-text`. Nav bar inside the shell: height 60, max-width 1180, padding `0 8px`, logo mark 40 x 46.

**4.6.2 Panel (`d4m-panel`, the `.c` block)**
Radius 18, padding `14px 16px`, flex column, gap 8, `min-width: 0`. Fill `--color-bg`. Used for: the mode pills block, each option block, bit-rate, the Single thumbnail block, the Downloads status block and details block. Label above value, centred when the panel holds one control.
Panels are always the filled version, in both themes.

**4.6.3 Select and text input (`d4m-select`, input in `d4m-bitrate`, file name)**
Height 42, padding `0 14px`, radius 12, text 15/600, border `--field-border`, fill `--field-bg`. The select hides the native arrow and draws a 16px chevron at right 12, top 13, colour muted, with `padding-right: 36`. Text input uses `cursor: text`. Disabled: opacity .38, `cursor: not-allowed`. Caption and "Separate file" are two selects ("off" / "on") side by side, separated by a 1px vertical divider (`--color-border`), inside one panel.

**4.6.4 Segmented control (`d4m-segmented-control`)**
A group of pills (row 7 in 4.5) in a panel, flex, gap 10, wrap, centred. Exactly one pill has `aria-pressed="true"`.

**4.6.5 Switch (`d4m-toggle`)**
Track 46 x 26, pill. **Light:** transparent track, 2px `--color-primary` border, knob 18 at 2px, `--color-primary`. **Dark:** track `--color-surface`, 1px `--color-border`, knob 20 at 3px, `--color-text-muted`. **On (both):** track fill `--color-primary`, knob fill `--color-bg`. Knob `left: 22px` in light and **`left: 21px` in dark** *(rev 5, from the Trim boards: the right gap stays equal to the left, 2px light, 3px dark)*. Label to the right, gap 10, 14/700 muted ("Off" / "On").

**4.6.6 Checkbox (`d4m-checkbox`)**
22 x 22, radius 7, border 2px `--color-text-muted`, centred. Checked: fill and border `--color-primary`, check icon in `--color-bg`. Indeterminate (select-all) shows a dash instead of the check.

**4.6.7 Tag (`d4m-tag`)**
Inline-block, margin-top 5, padding `3px 10px`, pill, 12/700. Default (text "Default"): fill `--color-border`, text `--color-text`. **Applied** (`.set`, text like "1080p · mp4"): fill `--color-accent`, text `--color-action-fg`.

**4.6.8 Progress bar (`d4m-progress-bar`)**
Height 6, pill, track `--color-border`, fill `--color-primary`, margin `7px 0 6px` in rows, overflow hidden. Percent label 13/800 `--color-primary`. Meta line under the bar: flex space-between, gap 8, 12/700 muted, no wrap: `17.2 MB/s`, `412 / 615 MB`, `ETA 40 hrs`.

**4.6.9 Thumbnail box (`d4m-thumb-box`, placeholder when no image)**
Radius 12, fill `--color-surface`, border `--box-border`, icon colour `--box-fg`, play-triangle icon centred. Sizes: **row 84 x 56** (icon 26), **Single 150 x 100** (icon 34), **Downloads details preview** flex 1 with min-height 120 (icon 34 to 44). With a real `thumbnailUrl`, the image fills the box with `object-fit: cover`. **(rev 3)** New input `bordered: boolean`, default `true`. History rows use `false` (no border).

**4.6.10 List row (inside `item-container`)**
Height 82, padding `0 16px 0 14px`, gap 14, radius 18, fill `--color-bg`, border 1px transparent. Hover: border `--color-border`. **Selected (`.on`):** border `--color-primary`, fill = `--color-selected` tint over `--color-bg`. Content order: checkbox, thumb box 84 x 56, name block (flex 1, `min-width: 0`, title 15/700 on one line with ellipsis, tag or progress below), optional meta columns (File size, Duration: label 13/700 muted over value 15/700, min-width 62, 1px divider between), optional icon buttons.
When a row contains buttons (Downloads: pause, cancel, checkbox) the row itself is a `<div>`, because buttons cannot nest. When it contains none (Batch), the whole row can be one `<button aria-pressed>`.

**Compact row (rev 3, assumed: no design exists, derived from the Single compact layout).** At 720px and narrower the row keeps its height of 82 (virtual scroll depends on it) but gets tighter: padding `0 12px 0 10px`, gap 12. At a phone width of 360 to 390px the card leaves only 296 to 326px for a row, so the two meta columns (File size, Duration) and their divider **no longer fit and are replaced by one muted line under the title**, `40 MB · 12:48` (12/700 `--color-text-muted`, `—` for an unknown part; the Select page has no size, so it shows only `12:48`). On `option-select` rows the tag sits under that line, so a row has up to three lines (title 15/700, meta line, tag), about 62px, which fits in 82. The thumb box stays 84 x 56 and the title keeps its ellipsis. **Downloads rows (`download-info small`)** also need the room, so they **hide the thumb box**, keep the percent, and show the meta line as `speed · ETA` only (the size is in the details card). The pause and cancel buttons keep their 34 x 34 size. History rows: History spec 2.3.

**4.6.11 Scroll rail (internal to `item-container`)**
The native scrollbar is hidden. A custom rail sits on the left: width 12, track 2px `--color-border` at left 5 with 6px inset top and bottom. Thumb: width 6, left 3, pill, fill `--color-primary`, inner bottom shadow `inset 0 -2px 0 --color-primary-dark`, `cursor: grab`; while dragging, fill `--color-accent` and shadow `--color-accent-dark`. Thumb height = `max(34, track x visibleRows / totalRows)`. Thumb hidden when everything fits. Clicking the track jumps. List edges fade out with a mask (top 14px, bottom 22px).

**4.6.12 Nav bar (`core/layout/nav-bar`, not shared, full spec in `Down4More-Core-Shell-Spec.md`, listed here because it defines the look of links and the toggle)**
Logo mark left. Right: three links (button 11 in 4.5), gap 8, then the **theme toggle** (icon button 38 x 38, moon icon 18, an `aria-label` that follows the theme: "Switch to dark theme" / "Switch to light theme"). In the compact layout the links shrink to padding `8px 10px`, font 14, gap 4.

**4.6.13 Label / value / divider**
`.lab` 13/700 muted. `.val` 15/700 text. Vertical divider: 1px wide, `--color-border`, stretches to full height.

### 4.7 States (same for every control)

| State | Rule |
|---|---|
| Focus (keyboard) | `outline: 2px solid var(--color-accent); outline-offset: 2px` on select, input, pill, big button, row, ghost. **(rev 3)** On the coloured History rows the ring is `--color-on-history`, because the accent red is invisible on a red row |
| Hover | ghost and row: border colour changes (see above). Big buttons: `filter: brightness(1.08)` |
| Active (pressed) | big buttons: `filter: brightness(.94)` |
| Disabled | select, input, pill: opacity .38, `cursor: not-allowed`. Buttons: opacity .5, no pointer events (assumed, not shown in designs) |
| Loading | button shows a spinner and ignores clicks (assumed, not shown in designs) |

### 4.8 Global utilities (rev 3)

Written once in `styles.scss`. Pages use `.visually-hidden` for their `<h1>` (the designs have no visible title).

```scss
.visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
                   clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

---

## 5. UI primitives (`shared/ui/`) ***Approved (rev 3)***

The sketches repeat the same basic controls many times. Building them once avoids duplicate code in 8+ places.

| Primitive | Used by |
|---|---|
| `d4m-icon` | nav-buttons, download-info, every primitive below |
| `d4m-checkbox` (with indeterminate) | item-container select all, media-thumbnail, download-info |
| `d4m-toggle` (the switch) | Single page: Frame Size, Trim Video |
| `d4m-segmented-control` | video-audio-select, plus Single page: Fill Type, Aspect Ratio |
| `d4m-select` | quality, format, caption, separate file |
| `d4m-progress-bar` | download-info |
| `d4m-panel` **(rev 2)** | the rounded block that holds a label and a control. Used in the download-options, Single, Batch and Downloads screens (look: 4.6.2) |
| `d4m-tag` **(rev 2)** | media-thumbnail option-select (Default / applied settings) (look: 4.6.7) |
| `d4m-thumb-box` **(rev 2)** | media-thumbnail, download-info. The thumbnail frame and its placeholder (look: 4.6.9) |

**One uniform API for all of them:**

```ts
value = model.required<T>();        // two-way: [(value)]
disabled = input(false);
label = input<string>();            // visible label
options = input<Option<T>[]>();     // only select / segmented-control
```

`d4m-icon` takes `name = input.required<IconName>()` and `size = input(20)`. Icon names used so far: `plus`, `x`, `pause`, `play`, `check`, `retry`, `arrow-down`, `chevron-left`, `chevron-right`, `trash`, `warning`, `moon`, `sun`, `arrow-up`, `search`. The exact look of each primitive is in section 4.6.

**Decision (rev 3): approved.** `shared/ui/` is built first, before the components in section 6, because every one of them uses it. (The rejected alternative was native elements styled by global CSS.)

---

## 6. Component specs

Template for every section: **Purpose · Used by · API (inputs / outputs / slots) · Behaviour · States · ⚙ Backend later · Done when**.

---

### 6.1 `page-container`

**Path:** `shared/components/page-container/` · **Selector:** `d4m-page-container` · **Used by:** every page

**Purpose:** the big white rounded card every page puts its content in (`.box` in the mock). It is pure layout. The page background and nav live in the shell (`app.component`), not here.

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | max-width 640 / 920 / **1040** px, centred **(rev 2)**. Home uses `md`. Single, Batch and Downloads use `lg` |
| `padding` | `'default' \| 'split' \| 'compact' \| 'none'` | `'default'` | default = `40px 48px 36px` (Home). `split` = `32px 40px 36px` (Batch, Downloads) **(rev 2)** |
| `layout` **(rev 2)** | `'stack' \| 'split'` | `'stack'` | `split` = two columns: `[main]` flex `1.12 1 380px`, `[side]` flex `1 1 340px`, gap `28px 36px` (24 all round in the compact layout), `flex-wrap: wrap`. **(rev 3)** The columns stack, `[main]` on top and `[side]` under it, as soon as they cannot sit side by side. That happens when the card's inner width is under 380 + 36 + 340 = 756px, which is a viewport of about **900px** (the page specs said "about 800px", that was wrong), and it **always** happens in the compact layout. Stacked, both children take the full width, `[side]` keeps its DOM order and nothing is hidden |

| Slots (content projection) | Purpose |
|---|---|
| default | page content |
| `[header]` | optional top area (title, search bar) |
| `[footer]` | optional bottom area, normally `<d4m-nav-buttons footer ...>` |
| `[main]`, `[side]` **(rev 2)** | the two columns when `layout="split"` (the list on the left, options or details on the right) |

**Behaviour:** applies `--color-surface`, `--radius-card`, `--shadow-card`, 1px `--color-border`. Header and footer slots render only when something is projected (use `:empty` or `@if` on `ng-content` wrappers). On screens 720px and narrower, padding shrinks to `24px 16px` for every `padding` value except `none`.

**States:** none. **⚙ Backend later:** nothing.

**Done when:** all three sizes render; empty `[header]` / `[footer]` leave no gap; works with a very tall child without breaking the shadow; `layout="split"` stacks `[main]` over `[side]` at 390px and at 800px and sits side by side at 1000px.

---

### 6.2 `logo`

**Path:** `shared/components/logo/` · **Selector:** `d4m-logo` · **Used by:** `nav-bar` (mark), `home` title (wordmark)

**Purpose:** the single source of the logo SVG. The mock pastes it twice. Now it exists once.

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'mark' \| 'wordmark'` | `'mark'` | mark = icon only. wordmark = "Down" + mark + "More" |
| `height` | `number \| string` | `46` | mark only (px or CSS length). The wordmark sizes with the parent `font-size` (em based) |
| `label` | `string` | `'Down4More'` | accessible name |

**Behaviour:** SVG polygons coloured only via `--logo-*` tokens (see 4.2). In `wordmark`, "Down" uses `--logo-primary`, "More" uses `--logo-accent`, and the mark sits between them at `0.95em` height. It is **not** a link. The caller wraps it (`<a routerLink="/">` in the nav).

**States:** none. **⚙ Backend later:** nothing.

**Exact SVG (rev 2).** One `<svg viewBox="860 185 925 1070">` with 6 polygons, in this order. Class to token: `lb` = `--logo-primary`, `lbs` = `--logo-primary-dark`, `lr` = `--logo-accent`, `lrs` = `--logo-accent-dark`.

| # | Class | `points` |
|---|---|---|
| 1 | `lb` | `1316,193 1537,193 1350,411 1127,669 872,669` |
| 2 | `lr` | `1537,193 1537,1040 1647,1040 1445,1243 1242,1040 1351,1040 1351,411` |
| 3 | `lr` | `872,669 1774,669 1667,855 962,855` |
| 4 | `lrs` | `1351,411 1537,193 1351,472` |
| 5 | `lbs` | `872,669 1167,620 1127,669` |
| 6 | `lrs` | `1351,855 1537,855 1537,886 1351,886` |

Aspect ratio is 925 : 1070 (about 0.865). Default mark is **46 tall x 40 wide**.

**Implementation (rev 2).** One template, so the polygons exist once. The wordmark is the same SVG with two text spans around it.

```html
<!-- logo.component.html -->
<span class="logo" [class.logo--wordmark]="variant() === 'wordmark'" role="img" [attr.aria-label]="label()">
  @if (variant() === 'wordmark') { <span class="logo__down" aria-hidden="true">Down</span> }
  <svg class="logo__mark" viewBox="860 185 925 1070" aria-hidden="true" [style.height]="markHeight()">
    <polygon class="lb"  points="1316,193 1537,193 1350,411 1127,669 872,669"/>
    <polygon class="lr"  points="1537,193 1537,1040 1647,1040 1445,1243 1242,1040 1351,1040 1351,411"/>
    <polygon class="lr"  points="872,669 1774,669 1667,855 962,855"/>
    <polygon class="lrs" points="1351,411 1537,193 1351,472"/>
    <polygon class="lbs" points="872,669 1167,620 1127,669"/>
    <polygon class="lrs" points="1351,855 1537,855 1537,886 1351,886"/>
  </svg>
  @if (variant() === 'wordmark') { <span class="logo__more" aria-hidden="true">More</span> }
</span>
```

```scss
// logo.component.scss
:host { display: inline-flex; }
.logo { display: inline-flex; align-items: center; font-weight: 800; }
.logo__mark { display: block; width: auto; aspect-ratio: 925 / 1070; }
.logo--wordmark .logo__mark { height: .95em; margin: 0 .05em; }      // overrides the inline height
.logo__down { color: var(--logo-primary); }
.logo__more { color: var(--logo-accent); }
.lb  { fill: var(--logo-primary); }      .lbs { fill: var(--logo-primary-dark); }
.lr  { fill: var(--logo-accent); }       .lrs { fill: var(--logo-accent-dark); }
```

```ts
// logo.component.ts
@Component({ selector: 'd4m-logo', templateUrl: './logo.component.html', styleUrl: './logo.component.scss',
             changeDetection: ChangeDetectionStrategy.OnPush })
export class LogoComponent {
  variant = input<'mark' | 'wordmark'>('mark');
  height  = input<number | string>(46);
  label   = input('Down4More');
  markHeight = computed(() => this.variant() === 'wordmark' ? null
    : typeof this.height() === 'number' ? `${this.height()}px` : (this.height() as string));
}
```

**Done when:** colours change only by editing tokens; the wordmark scales when the heading font-size changes.

---

### 6.3 `nav-buttons`

**Path:** `shared/components/nav-buttons/` · **Selector:** `d4m-nav-buttons` · **Used by:** home (Fetch), single, playlist select and options, downloads toolbar (history has none)

**Purpose:** one config-driven button row. Pages describe **which** buttons they want. The component never changes.

```ts
export interface NavButton {
  id: string;                                   // returned in the event
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'apply';   // default 'secondary'. 'apply' = amber (rev 2)
  side?: 'start' | 'end';                       // default 'end'
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;                            // shows spinner, blocks clicks
  hidden?: boolean;
  pressed?: boolean;                            // (rev 3) sets aria-pressed and the pressed look of the ghost button (4.5 row 6). Pause all uses it
  title?: string;                               // (rev 3) native tooltip. Pause all shows 'Resume all' while pressed
}
```

| Inputs | Type | Notes |
|---|---|---|
| `buttons` | `NavButton[]` (required) | render order = array order |
| `size` | `'sm' \| 'md' \| 'lg'` | `sm` = 36px ghost toolbar buttons inside `item-container`, `md` = 44px (Fetch), `lg` = 72px Download / Apply in side panels **(rev 2)** |
| `fullWidth` **(rev 2, rev 3)** | `boolean \| 'compact'` | `true`: each button fills its row (Options side panel). `'compact'`: fills its row only in the compact layout (Select page, Next). Default `false` |

| Outputs | Type |
|---|---|
| `pressed` | `string` (the `id`) |

**Presets** (`nav-buttons.presets.ts`). Factories so nobody retypes labels:

| Factory | id | Label | Variant | Side | Icon |
|---|---|---|---|---|---|
| `navBack()` | `back` | Back | ghost | start | chevron-left |
| `navNext()` | `next` | Next | primary | end | chevron-right |
| `navFetch()` | `fetch` | Fetch | primary | end | arrow-down |
| `navDownload()` | `download` | Download | primary | end | arrow-down |
| `navApply()` | `apply` | Apply | **apply** (amber) | end | check |

**Usage. The same component for single and batch, only the handler differs:**

```ts
// single.component.ts
buttons = computed(() => [
  { ...navDownload(), loading: this.starting() },
]);
onPressed(id: string) {
  if (id === 'download') this.download.start([this.buildRequest()]);          // array of 1
}

// playlist-options.component.ts (full code in the Options page spec)
downloadButtons = computed(() => [
  { ...navDownload(), label: `Download (${this.state.targetItems().length})`, loading: this.starting() },
]);
onPressed(id: string) {
  if (id === 'apply')    this.state.apply();                                    // frontend state only
  if (id === 'download') this.download.start(this.state.requests());            // array of N
}
```

```html
<d4m-nav-buttons footer [buttons]="buttons()" (pressed)="onPressed($event)" />
```

**Look:** every size and variant is specified in 4.5. In the Batch and Single designs Download and Apply are **inside the side panel** (size `lg`), not in a page footer. The component does not care where it is placed.

**Behaviour:** `start` buttons are left-aligned, `end` buttons right-aligned. Hidden buttons are not rendered. A `loading` or `disabled` button never emits. Uses the global `.btn` classes from 4.5 and `<button type="button">`.

**States:** default, disabled, loading, hidden. **⚙ Backend later:** nothing. The page toggles `loading` while its service call runs.

**Done when:** a new page can add a button (for example "Pause all") by adding one object to its array, with no change to this component.

---

### 6.4 `download-options` (wrapper) and its 5 children

**Path:** `shared/components/download-options/` (children in sub-folders) · **Selector:** `d4m-download-options` · **Used by:** single, playlist options (one panel for Global or for the ticked rows)

**Purpose:** one component owns the whole options block and the dependencies between fields, so single and playlist never duplicate that logic.

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `settings` | `model<DownloadSettings>` (required) | | two-way: `[(settings)]="settings"` |
| `catalog` | `DownloadOptionsCatalog` (required) | | what the user may pick |
| `disabled` | `boolean` | `false` | disables every child |
| `hiddenFields` | `OptionField[]` | `[]` | `'mode' \| 'quality' \| 'format' \| 'bitrate' \| 'captions'`. Lets a page drop a field without a new component |
| `columns` | `1 \| 2` | `2` | grid columns |
| `layout` **(rev 3, it was only described below)** | `'stacked' \| 'contents'` | `'stacked'` | `contents` = host is `display: contents`, so the page grid places the five panels by name (Single, Options) |

**Dependency rules.** Implemented once in the pure function `applyOptionRules(settings, catalog)`. The wrapper calls it on every change.

| Mode | quality | format list | bitrate | captions |
|---|---|---|---|---|
| video+audio | enabled | `videoFormats` | enabled | enabled |
| audio-only | disabled, value becomes `null` | `audioFormats` | enabled | enabled, `separateFile` forced `true` and locked |
| video-only | enabled | `videoFormats` | disabled, value becomes `null` | enabled |

- Disabled fields stay visible and dimmed, so the layout never jumps.
- **(rev 4)** If `quality` is not in `catalog.qualities` it becomes `fallbackQuality(quality, catalog.qualities)` (nearest lower, else the lowest above). This only keeps the panel's select valid; the per-video download fallback is backend work (`Down4More-Per-Video-Options-Spec.md`).
- If the chosen `format` is not valid for the new mode, it resets to the first valid one. If a disabled field becomes enabled again, it restores a sensible default (first quality, `catalog.bitrate.min`, ...).
- `separateFile` is only editable when `captions.enabled` is true. Turning captions off resets `separateFile` to `false`.
- The emitted `settings` is always normalised (`null` for non-applicable fields). The backend must never receive `quality` with `audio-only`.

**Children.** Dumb components. Each has the same API: `value` model, `disabled`, `label` (optional override), plus `options` where a list is needed.

| Child | Selector | Value type | Extra input | Renders (using ui primitives) |
|---|---|---|---|---|
| `video-audio-select` | `d4m-video-audio-select` | `MediaMode` | | segmented control: video+audio / audio only / video only |
| `quality` | `d4m-quality` | `string \| null` | `options: string[]` | select |
| `format` | `d4m-format` | `string` | `options: string[]` | select |
| `bitrate` | `d4m-bitrate` | `number \| null` | `range: {min,max,step}` | number input with "kbps" suffix, clamped to the range on blur |
| `captions` | `d4m-captions` | `CaptionSettings` | | two **selects** (off / on): "Caption" and "Separate file", side by side with a vertical divider, in one panel **(rev 2, the designs use selects)** |

Children never know about each other. Only the wrapper does.

**Layout (rev 2):** the wrapper puts each child in a `d4m-panel`. Batch order: mode pills (full width), quality + format (two columns), captions pair, bit-rate. The Single design mixes these panels with its own file name, Frame Size, Trim and Download blocks in one grid, so the wrapper also supports `layout: 'stacked' | 'contents'` (`contents` = host is `display: contents`, so the page grid places the panels).. In `contents` mode each panel gets `grid-area: <field name>` and a class `area-<field name>` (`mode`, `quality`, `format`, `bitrate`, `captions`), so the page grid can use those names directly (see `Down4More-Single-Page-Spec.md`). DOM order is `captions`, `mode`, `quality`, `format`, `bitrate`. **(rev 3)** The wrapper has no compact rules of its own: the page grid decides (Single spec 3, Options spec 2.2). The mode pills wrap inside their panel.

**Captions rule (final):** captions stay enabled in every mode, exactly as in the rules table above (audio-only forces and locks "separate file"). The Batch prototype that greyed them out was an accident.

**Usage:**

```html
<d4m-download-options [(settings)]="settings" [catalog]="catalog()" />
<!-- Playlist Options and Single: the page grid places the five panels by name -->
<d4m-download-options layout="contents" [(settings)]="state.draft" [catalog]="state.effectiveCatalog()" />
```

**States:** default, disabled, mode-switch transitions. **⚙ Backend later:** `catalog` comes from `fetchInfo()`: per video (`MediaItem.catalog`), with `FetchResult.catalog` as the main and fallback list. The component is unchanged. See `Down4More-Per-Video-Options-Spec.md`.

**Done when:** all 3 rows of the rules table are covered by unit tests on `applyOptionRules`; switching mode in the UI never produces an invalid combination; a page can hide a field with one input.

---

### 6.5 `media-thumbnail`

**Path:** `shared/components/media-thumbnail/` · **Selector:** `d4m-media-thumbnail` · **Used by:** single, playlist select (`pre-select`), playlist options (`option-select`)

**Purpose:** shows one piece of media in 3 variants (design decision from the "afterthoughts" notes: 6 thumbnails collapse into 2 components).

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `item` | `MediaItem` (required) | | |
| `variant` | `'single' \| 'pre-select' \| 'option-select'` (required) | | |
| `selected` | `model<boolean>` | `false` | checkbox state (pre-select, option-select only) |
| `showCheckbox` **(rev 3)** | `boolean` | `true` | `false` hides the checkbox. The Options page sets it to `false` in Global mode (the row stays clickable) |
| `active` | `boolean` | `false` | option-select: reserved, **not used by the playlist flow** (a row click toggles selection) |
| `appliedTag` **(rev 2)** | `string \| null` | `null` | option-select: text of the tag under the title. `null` shows "Default", a string like `1080p · mp4` shows the applied (red) tag. The page builds the string from `playlist-state`. "Unsaved changes" is **not** on the row, the page shows it next to the Apply button |
| `loading` | `boolean` | `false` | skeleton while info is being fetched |

| Outputs | Type | Notes |
|---|---|---|
| `activate` | `string` (the item id) | option-select: reserved, **not used by the playlist flow** |

| | **single** | **pre-select** | **option-select** |
|---|---|---|---|
| Layout | 150 x 100 thumb box + detail block (channel, size, duration) | one row, `--row-height` (82) | one row, `--row-height` (82) |
| Title | yes | yes | yes |
| Channel | yes | no | no |
| Duration | yes | yes | yes |
| Size | yes | no | yes (shows `—` while `sizeBytes` is null) |
| Checkbox | no | yes | yes (hidden when `showCheckbox` is `false`) |
| Applied-settings tag | no | no | yes |
| Click on row | nothing | toggles checkbox | **(rev 3)** toggles selection: the whole row is one `<button aria-pressed>` (4.6.10) |

**Rules:** in `single` the title clamps to 2 lines, in the two row variants it is **one line with ellipsis** (4.6.10, **rev 3**: this used to say 2 lines for all). The full title is always in the `title` attribute. In the compact layout the row variants replace the meta columns with one meta line (4.6.10). Missing `thumbnailUrl` shows a neutral placeholder. `durationSec: null` shows `—`. Rows must be exactly `--row-height` tall, because `item-container` virtual scroll depends on it.

**States:** default, selected, default tag, applied tag, loading (skeleton), no thumbnail. **⚙ Backend later:** `sizeBytes` is a backend estimate that changes after Apply. The page updates the `item`, and this component just re-renders.

**Done when:** all three variants render from the same `MediaItem`; the row height matches the token; in `option-select` a click anywhere on the row toggles it, and with `showCheckbox = false` the row still toggles.

---

### 6.6 `download-info`

**Path:** `shared/components/download-info/` · **Selector:** `d4m-download-info` · **Used by:** downloads (small, big), history (history)

**Purpose:** shows one download with live progress, in 3 variants.

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `item` | `DownloadItem` (required) | | |
| `variant` | `'small' \| 'big' \| 'history'` (required) | | |
| `selectable` | `boolean` | `false` | shows a checkbox |
| `selected` | `model<boolean>` | `false` | |

| Outputs | Type |
|---|---|
| `action` | `DownloadActionEvent` (`{ type, id }`). One output for every button, so the page forwards it straight to `control()` |

| | **small** | **big** | **history** |
|---|---|---|---|
| Thumbnail | 84 x 56 box | preview box (flex, min-height 120) | 84 x 56 box |
| Title | yes | yes | yes |
| Channel | no | yes | no |
| Progress bar + % + speed + ETA + `x / y MB` | yes | yes | no |
| Format / quality / bitrate chips | no | yes | format + quality |
| Date (`finishedAt`) | no | no | yes |
| Status badge | colour + icon | colour + icon | "Succeeded" / "Failed" |

**`big` is a details panel (rev 2).** In the Downloads design it is not a list row. It sits in the right column and shows the **selected** download: preview box, "Video" and "Channel" on the left, "Format / Quality / Bit-rate" as a small label-value table on the right (13/700 values, 12/700 labels), then percent (20/800), speed, `x / y MB`, ETA, and a full-width progress bar with pause and cancel icon buttons. The page passes it the selected item. `small` and `history` are list rows (look: 4.6.10). Icon buttons: 4.5 row 9. **(rev 3)** `big` renders **only its content**; the page puts it in a `d4m-panel`.

**`history` variant (rev 3).** Exactly History spec 2.3: a solid green or red row (tokens in 4.2), Quality / Format / Size columns, a white chip, Retry and Remove. It emits `retry` and `remove`. `small` and `big` emit `dismiss` where `history` emits `remove`. The date comes from `formatWhen`.

**Compact layout (rev 3, assumed).** `small`: no thumb box, the percent stays, the meta line is `speed · ETA` (4.6.10). `big`: one column in this order: preview box (full width, min-height 120), Video and Channel, the Format / Quality / Bit-rate table as three label-value rows (label left, value right, 12/700 labels, 13/700 values), then percent, speed, size and ETA (wrapping to two lines if needed), then the progress bar with the pause and cancel icon buttons.

**Actions shown by status** (a button is rendered only if it is valid for that status):

| Status | Progress area | Actions |
|---|---|---|
| queued | "Queued" | cancel (a queued item can still be paused by Pause all, then it shows resume and cancel) |
| downloading | bar, %, speed, ETA | pause, cancel |
| paused | bar frozen, "Paused" | resume, cancel |
| processing | full bar, "Processing" (ffmpeg merge or convert) | none (cancel disabled) |
| done | none, badge | dismiss (`history` variant: remove) |
| failed | error text (`item.error`) | retry, dismiss (`history` variant: retry, remove) |

In `history` variant, only `done` and `failed` can occur. `retry` appears for `failed`, `remove` always.

**Rules:** `progress` is clamped 0 to 100. **(rev 3)** The bar has `role="progressbar"`, `aria-valuenow` and `aria-label="Progress of <title>"` and is **not** a live region. Its fill is `--color-apply` while `status === 'processing'`. Missing speed, ETA or total shows `—`. Number formatting comes only from the pipes in section 3. No timers inside the component. It only displays what it receives.

**States:** the six statuses above, selected, long title, unknown size. **⚙ Backend later:** `item` updates arrive from `downloads$()`. The page or service should throttle updates to about 4 per second (outside this component). Component unchanged.

**Done when:** every status x variant combination renders without layout shift; actions emit the right `{type, id}`; no business logic besides formatting.

---

### 6.7 `item-container`

**Path:** `shared/components/item-container/` · **Selector:** `d4m-item-container` · **Used by:** playlist select, playlist options, downloads, history

**Purpose:** scrollable list with **select all** and selection state, generic over any row component. **The page decides how many rows are visible** with `visibleRows` (rev 2). This is the "put new things where needed" piece. A page decides what a row looks like through a template.

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `items` | `T[]` (required) | | already filtered by the page (history search, etc.) |
| `itemId` | `(item: T) => string` | `item => item.id` | |
| `selectable` | `boolean` | `false` | shows the select-all header |
| `selectedIds` | `model<string[]>` | `[]` | two-way `[(selectedIds)]` |
| `virtualScroll` | `boolean` | `true` | uses Angular CDK `cdk-virtual-scroll-viewport` |
| `visibleRows` **(rev 2)** | `number` | `5` | **how many rows are visible at once.** The list height is computed from it, the rest scrolls |
| `rowHeight` | `number` | `82` | px, must equal the row height (`--row-height`) |
| `rowGap` | `number` | `10` | px between rows (`--row-gap`) |
| `heightMode` | `'fixed' \| 'fit'` | `'fixed'` | `fixed` keeps the height of `visibleRows` even with fewer items (stable layout). `fit` shrinks to the content |
| `selectAllLabel` **(rev 2)** | `string` | `'Select all'` | text of the header ghost button (`'Global'` in Playlist Options) |
| `noSelectionMeansAll` **(rev 2)** | `boolean` | `false` | Playlist Options: nothing selected = Global mode. The ghost button shows pressed when `selectedIds` is empty, and clicking it clears the selection |
| `summary` **(rev 2)** | `string \| null` | `null` | text on the right of the header. Default `"N of M selected"`. The page can pass `"Global · 9 videos · 638 MB"` |

| Outputs | Type | Notes |
|---|---|---|
| `itemActivated` | `string` (id) | optional, when a page wants row click |
| `scrolledToEnd` | `void` | reserved for lazy loading later |

| Slots | Purpose |
|---|---|
| `ng-template[d4mItem]` | **row template.** Context: `$implicit` (the item), `selected` (boolean), `toggle()` (flip this row), `index` |
| `[toolbar]` | extra buttons on the right of the select-all header (for example Pause all, Priority) |
| `[empty]` | shown when `items` is empty |

**Height (rev 2):** `height = visibleRows x rowHeight + (visibleRows - 1) x rowGap + 4`. With the defaults (5 rows) that is 454px, matching the 452px in the designs. For virtual scroll the CDK `itemSize` is `rowHeight + rowGap`, and each row template sits in a wrapper of exactly that size. Examples: `[visibleRows]="3"` for a compact picker, `"8"` for a tall history list.

**Header (rev 2):** a ghost button (4.5 row 6, `aria-pressed`) labelled `selectAllLabel`, then the `[toolbar]` slot (for example Pause all), then the summary text on the right (14/600 muted). The list below has the custom scroll rail (4.6.11). **(rev 3)** The header is `display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px`, so in the compact layout the summary drops under the buttons (right-aligned) instead of squeezing them. With `selectable = false` there is **no header at all** and no checkbox column (History). Toggling a row **appends its id to the end of `selectedIds`** (the order is meaningful: the Downloads details card shows the last one). Select all keeps list order.

**Select-all rules:** the button is pressed when all current `items` are selected. Clicking it selects or clears **all current `items`** (so a filtered list selects only what is visible). When `items` changes, ids that no longer exist are removed from `selectedIds`. With `noSelectionMeansAll`, see its input row above. The row checkbox is the `d4m-checkbox` look (4.6.6) and is hidden in Global mode.

**Three uses, one component:**

```html
<!-- playlist select -->
<d4m-item-container [items]="state.items()" [selectable]="true" [visibleRows]="5" [(selectedIds)]="state.chosenIds">
  <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
    <d4m-media-thumbnail variant="pre-select" [item]="item" [selected]="sel" (selectedChange)="toggle()" />
  </ng-template>
</d4m-item-container>

<!-- downloads (adds toolbar buttons, different row) -->
<d4m-item-container [items]="downloads()" [selectable]="true" [visibleRows]="5" [(selectedIds)]="selected">
  <d4m-nav-buttons toolbar size="sm" [buttons]="toolbar()" (pressed)="onToolbar($event)" />
  <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
    <d4m-download-info variant="small" [item]="item" [selectable]="true" [selected]="sel"
                       (selectedChange)="toggle()" (action)="onAction($event)" />
  </ng-template>
  <p empty>No downloads yet.</p>
</d4m-item-container>

<!-- history: same as downloads, variant="history", search bar filters items() before it arrives here -->
```

**States:** empty, populated, fewer items than `visibleRows`, all / some / none selected, 1000+ items (virtual scroll must stay smooth), `virtualScroll=false` for tiny lists. **⚙ Backend later:** nothing.

**Done when:** `visibleRows` of 3, 5 and 8 each show exactly that many rows; it works with `media-thumbnail` and `download-info` without code changes in the container; select-all is correct with a filtered list; 1000 mock rows scroll smoothly.

---

## 7. Reuse matrix: which page uses which shared element

| Page | page-container | logo | nav-buttons | download-options | media-thumbnail | download-info | item-container |
|---|---|---|---|---|---|---|---|
| Shell (`nav-bar`) | | mark | | | | | |
| Home | yes | wordmark | Fetch | | | | |
| Single | yes | | Download | yes | `single` | | |
| Playlist select | yes | | Next | | `pre-select` | | yes |
| Playlist options | yes | | Apply, Download (in the side panel) | yes (one panel: Global or the ticked rows) | `option-select` | | yes |
| Downloads | yes | | toolbar (Pause all, Priority) | | | `small`, `big` | yes |
| History | yes | | none | | | `history` | yes |
| Settings | yes | | optional Save | | | | |

### Button handlers per page (the only single vs batch differences)

| Page | Button | Handler does | Backend call? |
|---|---|---|---|
| Home | Fetch | collect URLs, call `fetchInfo(urls)`. Result `kind` decides navigation: `single` goes to Single, `playlist` goes to Select (`/playlist/select`) | **yes** |
| Single | Download | `startDownloads([request])` (array of 1, `extras` filled from frame-size, trim, file-name) | **yes** |
| Select | Next | navigate to Options. **No backend call in v1** (sizes come from `fetchInfo`) | no |
| (none in v1) | Back | `navBack()` exists as a preset, but no page uses it: the logo and the browser back button return | no |
| Options | Apply | `PlaylistStateService.apply()`: stamp the draft on the target rows (ticked, or all in Global) | **no** (frontend state only) |
| Options | Download | blocked while there are unsaved changes, else `startDownloads(requests)` (array of N, one per target row, each with its applied settings) | **yes** |
| Downloads | Pause all / row actions | `control('pause', ids)` etc. | **yes** |
| History | Retry / Remove | `control('retry' / 'remove', ids)` | **yes** |

**Placement (rev 2, rev 3):** Apply and Download in Options, and Download in Single, are rendered **inside the side panel** at size `lg` (see 6.3 and 4.5), not in a page footer. Next (Select page) stays in the `[footer]` of `page-container`. In the compact layout the side panel sits under the list, so Download is the last thing on the Options page and bottom right on Single.

---

## 8. Mock data and dev playground (so the team can work before the backend exists)

- `core/mocks/mock-data.ts`: `MOCK_MEDIA_ITEMS` (12+ items, include one with a very long title, one with no thumbnail, one with `durationSec: null`), `MOCK_DOWNLOADS` (at least one per status), `MOCK_CATALOG`.
- `core/services/mock-api.service.ts` implements `ApiService`: `fetchInfo` resolves after about 600 ms, `downloads$()` ticks progress every second, `control()` mutates local state.
- **Dev playground route** (`/dev`, registered only when not in production): one page showing every shared component in every state and variant, **in both themes (a toggle at the top)**. Teammates verify their component there, and reviewers use it instead of running the whole flow.

---

## 9. Definition of done (PR checklist for every shared component)

- [ ] Follows all rules in section 1 (standalone, OnPush, signals, `d4m-` prefix, no forbidden imports)
- [ ] Only uses types from `core/models` and tokens from section 4 (no hard-coded colours)
- [ ] Every variant and state in its spec section renders in the `/dev` playground
- [ ] Looks match section 4 in **both** light and dark (colours, sizes, radii, states)
- [ ] **(rev 3)** Checked in the compact layout (390px wide) in `/dev`, both themes: no horizontal scroll, nothing cut off
- [ ] Unit tests: inputs to DOM and outputs, plus pure helper tests where they exist
- [ ] `index.ts` barrel exports the component and public types
- [ ] Keyboard: reachable with Tab, activated with Enter / Space, visible focus
- [ ] Icon-only buttons have `aria-label`
- [ ] No `console.log`, no `any`, ESLint + Prettier pass
- [ ] Long title, empty and loading cases checked

---

## 10. Decisions needed before starting

1. **Angular version** of the project (affects `standalone: true` and signal APIs).
2. ~~UI primitives~~ **Approved (rev 3):** build `shared/ui/` (icon, checkbox, toggle, segmented-control, select, progress-bar, panel, tag, thumb-box), see section 5.
3. **Audio-only captions rule** (6.4): forced "separate file". Confirm.
4. **Bitrate control** (6.4): free number input within a range, or a fixed list?
5. ~~Success / warning colours~~ **Resolved by the designs (rev 2):** `--color-success` and `--color-apply` / `--color-warning`, see 4.2.
6. **Size estimates**: when Apply changes quality, does the backend re-estimate sizes, or do we hide size in option-select until downloaded? (6.5)
7. **Electron-only actions** such as "open file / open folder" on completed downloads. Not in v1 unless wanted (6.6).
