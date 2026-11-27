# Down4More — P3 instructions

> **Your job:** Utils and pipes, media-thumbnail, download-info, trim-video, History page, Settings placeholder.
> **How to read this file:** sections 0 to 6 are the same for everyone. Section 7 is **your** list of turns. Each turn has a ready-to-paste prompt.

## 0. What this file is

Down4More is an Angular frontend. Five people build it in one day with Antigravity. **This file is your whole job.** It is split into numbered **turns**. For each turn:

1. Check the **Wait for** line. If the checkpoint is not on `main` yet, skip to the next turn that is unblocked, or wait.
2. `git checkout main && git pull`, then `git checkout -b <your-branch-name-from-the-turn>`.
3. Open Antigravity. **Attach** the listed files (this file counts as one of them).
4. Copy the whole block under **Prompt** and send it.
5. When it finishes, read its final report (format in section 6). Run `ng build` and the tests yourself once.
6. Commit, push, open a PR to `main`, and tell P1 in the team chat. **P1 merges PRs.** Then start the next turn.

---

## 1. One-time setup (everyone, 10 minutes)

1. Clone the repo. Create the folder `docs/specs/` and copy the 17 spec files into it. **Rename them to remove the `(1)`, `__2_`, `__3_` suffixes**, so the names are exactly:

```
Down4More-Project-Tree.md                  Down4More-Home-Page-Spec.md
Down4More-Shared-Components-Spec.md        Down4More-Single-Page-Spec.md
Down4More-Core-Shell-Spec.md               Down4More-Playlist-Flow-Spec.md
Down4More-App-Routing-Spec.md              Down4More-Playlist-Select-Page-Spec.md
Down4More-Mock-Api-Service-Spec.md         Down4More-Playlist-Options-Page-Spec.md
Down4More-Download-Options-Decisions-Spec.md   Down4More-Downloads-Page-Spec.md
Down4More-Format-Utils-Spec.md             Down4More-History-Page-Spec.md
Down4More-Dev-Playground-Spec.md           Down4More-Per-Video-Options-Spec.md
Down4More-Single-Page-Style-Notes.md
```

2. Put your own instruction file in `docs/team/` (for example `docs/team/P1-instructions.md` for P1).
3. `Down4More-Single-Page-Style-Notes.md` (the Trim panel's exact look: sizes, colours per theme, SCSS) is the 17th spec file. It is attached only to the turns that need it (P1 T1 for the tokens, P3 T6 for the component).

---

## 2. Checkpoints (merge points)

| Checkpoint | Approx. time | What is on `main` |
|---|---|---|
| **M1** | 0:45 | P1: scaffold, tokens, models, `ApiService`, routes, **stubs for every page and every demo** |
| **M1b** | 1:00 | P1: `d4m-icon` (merged alone, right after M1) |
| **M2** | 2:30 | UI primitives (P1 + P2), `page-container`, `logo`, all `core/utils` + pipes (P3), mock data + all core services + `MockApiService` (P4), `ThemeService` (P5), `toggle-panel` + `file-name` (P2) |
| **M3** | 4:30 | `item-container`, `download-options`, `media-thumbnail`, `download-info`, `trim-video`, `url-bar`, `url-list`, `nav-buttons`, `nav-bar` + shell, guards + `PlaylistStateService` |
| **M4** | 7:00 | All pages: Home, Single, Select, Options, Downloads, History, Settings |
| **M5** | 8:30 | `/dev` demos, end-to-end check, final review |

If you finish a turn early, start the next turn that is already unblocked. Do not wait for the clock.

---

## 3. Rules for every turn (Antigravity MUST follow these)

**Read first.** Before writing code, read `docs/specs/Down4More-Project-Tree.md`, the specs attached to the turn, and this file.

**Spec override rules** (the specs were written at different times and disagree in a few places):

1. **`Down4More-Download-Options-Decisions-Spec.md` wins** over every other spec. Bit-rate is a **select** fed by `catalog.bitrates: number[]` (the mock is `[96, 128, 160, 192, 256, 320]`), default **192**. Never use `{ min, max, step }`, a number input, or the default 300. `DownloadOptionsCatalog.bitrates` replaces `bitrate`. `media-thumbnail` has a `sizeOverride` input. `estimateSizeBytes` exists in `core/utils/estimate-size.ts`.
2. **`Down4More-Per-Video-Options-Spec.md` wins** over the Flow, Options and Decisions specs where they conflict. In short: a `MediaItem` may carry its own `catalog`; the options panel offers that video's `catalog` when exactly one row is the target and `FetchResult.catalog` otherwise (`PlaylistStateService.effectiveCatalog`); Apply and Download send the choice as picked. The per-video fallback of a quality or bit-rate is **backend work** (done inside `MockApiService.startDownloads`), never in the frontend.
3. **`formatEta(3600)` returns `"1 hr"`** (singular), as in section 3.1 of the Format Utils spec. `formatSpeed` and `formatEta` take **bytes per second** and seconds.
4. For the **look of a component**, the Shared Components spec (rev 3) wins. For the **layout and behaviour of a page**, that page's own spec wins.
5. Any other conflict: follow the spec of the thing you are building, make the smallest sensible choice, and write it under **Questions** in your final report. Never silently invent behaviour.

**Files.** Create and edit **only the files listed in your turn**. Never edit another owner's files (section 5). Never edit `core/models/`, `app.routes.ts`, `app.config.ts`, `styles.scss`, `angular.json`, `tsconfig.json` unless the turn says you own them. If you need a change there, stop and put it under **Questions**.

**Missing dependency.** If something you import does not exist on `main` yet, do **not** create it and do **not** fake it. Code against the signature in the spec, leave the import in place, and list it under **Unresolved imports** in your report. (Pull `main` again before you start each turn so most of these disappear.)

**Stack.** Angular 19+, standalone components, `ChangeDetectionStrategy.OnPush`, signal APIs (`input()`, `model()`, `output()`, `computed()`, `signal()`, `linkedSignal()`), `@if` / `@for`, `inject()`. No `any`. No `console.log`. No `localStorage` (only `ThemeService` may use it). External `.html` and `.scss` files. Selector prefix `d4m-`. File names are kebab-case. Import with the aliases `@core/*`, `@shared/*`, `@features/*`.

**Styling.**
- Tokens only: `var(--color-...)`, `var(--radius-...)`, `var(--field-border)`, and so on (Shared spec section 4). No hard-coded colours, radii or shadows in component SCSS. Both themes must work with no per-theme code.
- Responsive: the app has **one** breakpoint. In SCSS write `@use 'styles/breakpoints' as *;` at the top, then `@include compact { ... }`. **Never write `720px`** in a component. (The only two allowed exceptions are in the specs: `layout="split"` stacking, and the History row hiding its Format column under 860px.)
- Global classes already exist in `styles.scss` (P1 writes them): `.btn`, `.btn--sm`, `.btn--lg`, `.btn--primary`, `.btn--apply`, `.btn--secondary`, `.btn--ghost`, `.btn--danger`, `.btn--icon`, `.btn--circle`, `.btn--block`, `.btn--on-color`, `.btn--loading`, `.pill`, `.visually-hidden`. Use them. Do not redefine them in a component.

**`shared/` import rules.** Files in `src/app/shared/` may import only `@core/models`, `@core/utils`, and other `@shared/` code. They must **not** import `@core/services`, `Router`, or anything from `@features/`. Shared components are dumb: data in with `input()`, events out with `output()`.

**Shared component file set.** Every shared component folder has `<name>.component.ts`, `.html`, `.scss`, `.spec.ts` and an `index.ts` barrel that exports the component and its public types. Unit tests cover inputs to DOM and outputs. Pure functions get a `.spec.ts` next to them.

**Accessibility.** Real `<button>` / `<input>` elements, visible focus ring (`outline: 2px solid var(--color-accent); outline-offset: 2px`), `aria-label` on icon-only buttons, never colour alone to show status.

**Before you finish.** Run `ng build` and the unit tests (use the project's existing runner, for example `ng test --watch=false`). Fix every error **in your own files**. Do not "fix" other people's files; report them. Then tick every item of the spec's "Done when" list that applies to your turn.

---

## 4. Primitive API contract (`shared/ui/`) — everyone codes against this

P1 and P2 build these. P3, P4 and P5 use them. **Do not change a name or type.** Import as `import { CheckboxComponent } from '@shared/ui/checkbox';`.

| Selector | Inputs / models | Notes |
|---|---|---|
| `d4m-icon` | `name: IconName` (required), `size = 20`, `stroke = 2` | Inline SVG, `currentColor`. `IconName` = `plus x pause play check retry arrow-down arrow-up chevron-left chevron-right trash warning moon sun search`. Exported from `@shared/ui/icon` |
| `d4m-checkbox` | `value = model(false)`, `indeterminate = input(false)`, `disabled = input(false)`, `label = input('')` (the aria-label), `presentational = input(false)` | Normally a `<button role="checkbox" aria-checked>`. With `presentational = true` it renders only the look, as `<span aria-hidden="true">`, for use **inside a row that is already a `<button>`** (a button cannot contain a button) |
| `d4m-toggle` | `value = model(false)`, `disabled`, `label` (aria-label), `showText = input(true)` (shows "Off" / "On"), `expanded = input<boolean \| null>(null)` | `<button role="switch" aria-checked>`; sets `aria-expanded` only when `expanded` is not `null` |
| `d4m-segmented-control` | `value = model.required<T>()`, `options = input.required<Option<T>[]>()`, `disabled`, `label` | Pills (`.pill`), exactly one has `aria-pressed="true"` |
| `d4m-select` | `value = model.required<T>()` with `T extends string \| number \| null`, `options = input.required<Option<T>[]>()`, `disabled`, `label` (aria-label) | Native `<select>`, custom chevron (inline SVG, there is no `chevron-down` icon). Map option values by index so numbers and `null` work |
| `d4m-progress-bar` | `value: number` (0 to 100, clamped), `variant: 'default' \| 'processing'`, `label: string` | `role="progressbar"` + `aria-valuenow`. `processing` fill is `--color-apply`. Not a live region |
| `d4m-panel` | `label?: string` (visible label above the content), `padding: 'default' \| 'roomy'` | `roomy` = `20px 24px` (Trim panel). Projects its content |
| `d4m-tag` | `text` (required), `variant: 'default' \| 'applied'` | `applied` = red tag |
| `d4m-thumb-box` | `src: string \| null`, `size: 'row' \| 'single' \| 'preview'`, `bordered = true`, `alt = ''` | `row` 84x56, `single` 150x100, `preview` flex with min-height 120. Neutral placeholder with a play icon when `src` is null |

```ts
// shared/ui/option.model.ts (P2) and re-exported from @shared/ui/select
export interface Option<T> { value: T; label: string; disabled?: boolean; }
```

---

## 5. File ownership

| Owner | Owns |
|---|---|
| **P1** | `tsconfig.json`, `angular.json`, `src/index.html`, `src/styles.scss`, `src/styles/`, `src/environments/`, `core/models/`, `core/services/api.service.ts`, `app.routes.ts`, `app.config.ts`, `shared/ui/icon`, `checkbox`, `panel`, `tag`, `thumb-box`, `shared/components/page-container`, `item-container`, `features/downloads/`, `dev/dev-shell*`, `dev/dev.routes.ts`, `dev/demos/demo-registry.ts` |
| **P2** | `shared/ui/toggle`, `segmented-control`, `select`, `progress-bar`, `option.model.ts`, `shared/components/logo`, `download-options`, `features/single/single.component.*`, `features/single/components/toggle-panel`, `file-name`, `frame-size` |
| **P3** | `core/utils/` (all), `core/pipes/`, `shared/components/media-thumbnail`, `download-info`, `features/single/components/trim-video`, `features/history/`, `features/settings/` |
| **P4** | `core/mocks/`, `core/services/` (all except `api.service.ts` and `theme.service.ts`), `features/home/` |
| **P5** | `core/services/theme.service.ts`, `shared/components/nav-buttons`, `core/layout/nav-bar`, `app.component.*`, everything in `features/playlist/` (routes, guards, services, select, options), `features/single/guards/` |

**Stub handover.** At M1, P1 creates stub files for every page, guard, service (`MockApiService`), and `/dev` demo so the app compiles. **After M1 those stubs belong to their owner** (table above). The owner **overwrites the stub completely**. P1 never touches them again. Each owner also writes the `/dev` demo files for their own components (last turn of every file).

---

## 6. Final report format (Antigravity prints this at the end of every turn)

```
FILES CREATED/CHANGED: <list>
DONE-WHEN: <the spec checklist items, each marked done / not done>
UNRESOLVED IMPORTS: <imports of files that are not on main yet, or "none">
BUILD/TESTS: <ng build result, test result>
QUESTIONS / SPEC CONFLICTS: <anything you had to decide, or "none">
```

Paste this report into your PR description.

---

# 7. P3 turns

Your order: **T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8**. You own all pure helpers first (everyone depends on them, so be fast), then two big shared components, the Trim panel, and the History page.

---

## T1: Small helpers (merge first, P4 and P5 need them)

**Wait for:** M1. **Branch:** `p3/t1-small-utils`.
**Attach:** `Down4More-Home-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Single-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P3-instructions.md, then Home spec section 6 (URL parser), Flow spec section 5 (settingsTag, sameSettings) and Single spec section 6 (sanitizeName).

TASK: write four PURE functions (no Angular) in src/app/core/utils/, each with a .spec.ts next to it. Import types from '@core/models'.
1. parse-url.ts: exports UrlKind ('video' | 'playlist' | 'unknown'), ParsedUrl, and parseUrl(raw: string): ParsedUrl exactly as Home spec section 6: validity rules (trim, empty -> 'empty', add https:// when there is no scheme, must parse with new URL, scheme http/https, host contains a dot, else 'not-a-link'), normalisation (lowercase host, drop #fragment, drop trailing '/', drop tracking params si, feature, pp and utm_*), `key` = the normalised string, and the kind table (first match wins) for youtube.com (including m., music., www.), youtu.be and other hosts. A watch URL with both v= and list= is a 'video'. Tests required: empty, spaces, "not a url", scheme added, ftp rejected, host without a dot, tracking params stripped, duplicate key equality, EVERY row of the kind table, and a watch URL with both v= and list=.
2. sanitize-name.ts: sanitizeName(text: string): string: removes \ / : * ? " < > |, collapses spaces, trims, cuts to 150 characters, returns '' if nothing is left. Tests: empty, only illegal characters, 200 characters, spaces.
3. settings-tag.ts: settingsTag(s: DownloadSettings): string exactly as Flow spec section 5. Tests: the 4 rows of the table there.
4. same-settings.ts: sameSettings(a, b): boolean exactly as Flow spec section 5, field by field (captions is an object). Tests: equal, each field different.

Done when: all tests pass; `ng build` passes. Push and tell the team "parse-url is on main" as soon as T1 is merged.
Finish with the final report from section 6.
```

---

## T2: Option rules, defaults, size estimate

**Wait for:** M1. **Branch:** `p3/t2-option-utils`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Playlist-Options-Page-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P3-instructions.md, then Shared spec 6.4 (dependency rules table) and Decisions spec sections 1.3, 1.4 and 2.1 to 2.2. Remember: the Decisions spec wins, bit-rate comes from catalog.bitrates (number[]). Also read Per-Video spec section 2.2 (fallbackQuality).

TASK: pure functions in src/app/core/utils/, each with a .spec.ts:
1. nearest-bitrate.ts: nearestBitrate(wanted: number, available: number[]): number (Decisions 1.3). Tests incl. a tie and a single-element list.
1b. fallback-quality.ts: fallbackQuality(wanted: string, available: string[]): string | null exactly as Per-Video spec 2.2 (exact match kept; otherwise the nearest LOWER quality by its number; if none is lower, the lowest one above; a quality with no number -> first entry; empty list -> null). Tests: exact, nearest lower, none lower, no numbers, empty list.
2. default-download-settings.ts: defaultDownloadSettings(catalog): DownloadSettings as in Decisions 1.4: mode 'video+audio', quality '1080p' if the catalog has it else qualities[0], format videoFormats[0], bitrate = nearestBitrate(192, catalog.bitrates), captions { enabled: false, separateFile: false }.
3. apply-option-rules.ts: applyOptionRules(settings, catalog): DownloadSettings. Rules (Shared 6.4 + Decisions 1.3):
   - video+audio: quality enabled, format must be in catalog.videoFormats, bitrate enabled.
   - audio-only: quality becomes null, format must be in catalog.audioFormats, bitrate enabled.
   - video-only: quality enabled, format in videoFormats, bitrate becomes null.
   - If the format is not valid for the mode, reset it to the first valid one (video: videoFormats[0], audio: audioFormats[0]).
   - If a field is enabled but null (it was disabled before), restore a default: quality = '1080p' if available else the first quality; bitrate = nearestBitrate(192, catalog.bitrates).
   - If an enabled bitrate is not in catalog.bitrates, snap it to the nearest value.
   - If an enabled quality is not in catalog.qualities, replace it with fallbackQuality(quality, catalog.qualities). This only keeps the panel's select valid; the per-video download fallback is backend work (Per-Video spec section 3).
   - Captions: if captions.enabled is false then separateFile = false; if captions.enabled is true and mode is audio-only then separateFile = true.
   - The output is always normalised (null for non-applicable fields). Pure: never mutate the input.
   Tests: all 3 modes, switching away from and back to a bit-rate mode, a stale bit-rate snapping to the nearest, a stale quality falling to the nearest lower, format reset, captions rules, no input mutation.
4. estimate-size.ts: copy the implementation from Decisions spec 2.1 (AUDIO_SHARE 0.08, QUALITY_FACTOR table, estimateSizeBytes(baselineBytes, settings, baselineSettings)). Tests: null baseline -> null; unchanged settings -> same size; all three modes; the 4 rows of the worked example in 2.2 (720p v+a ~23.4 MB, 2160p video-only ~147.2 MB, audio-only 320 kbps ~5.3 MB).

Done when: all tests pass; `ng build` passes. Push and tell the team "apply-option-rules is on main".
Finish with the final report from section 6.
```

---

## T3: Formatters and pipes

**Wait for:** M1. **Branch:** `p3/t3-formatters`.
**Attach:** `Down4More-Format-Utils-Spec.md`, `Down4More-History-Page-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P3-instructions.md, then Format Utils spec fully, History spec section 3.2 and 3.3, Flow spec section 6 (the mock durations and sizes) and Shared spec section 3 (helpers).

TASK: pure functions in src/app/core/utils/ with .spec.ts files, plus two pipes.
1. format-duration.ts: formatDuration(sec: number | null): string. null -> '—'. Under one hour: mm:ss with zero-padded minutes ('12:48', '08:15', '03:27'); one hour or more: h:mm:ss ('2:00:00', '1:02:05' for 3725). Negative or NaN is clamped to 0.
2. format-size.ts: formatSize(bytes: number | null, unit: 'auto' | 'mb' = 'auto'): string, tables in History spec 3.3. MB = 1024*1024. 'auto': below 1 GB whole MB ('40 MB', '615 MB'); from 1 GB one decimal in GB ('1.1 GB', '2.0 GB'). 'mb': always whole MB with a thousands separator ('1,120 MB', '2,048 MB'); implement the separator by hand (do not rely on Intl). null -> '—'. Include every row of the table as a test, plus the Flow spec section 6 sizes (41943040 -> '40 MB', 213909504 -> '204 MB').
3. format-speed.ts: formatSpeed(bytesPerSec: number | null): string exactly as Format Utils spec section 1 (input is BYTES per second). Test every row of the table.
4. format-eta.ts: formatEta(sec: number | null): string using the singular/plural version from Format Utils spec 3.1 ('1 hr' for 3600, '3 hrs', '40 hrs' for 144000, '6 sec', '28 min', '12 min'; also use '1 min' singular for exactly 1 minute). Negative -> clamp to 0. Never NaN.
5. format-when.ts: formatWhen(iso: string, now: Date = new Date()): string exactly as History spec 3.2, with fixed arrays for day and month names (no Intl), local time zone. Implement ALL the required tests listed there (now = 2026-11-27 15:00 local).
6. src/app/core/pipes/duration.pipe.ts (DurationPipe, name 'duration') and file-size.pipe.ts (FileSizePipe, name 'fileSize', optional unit argument). Standalone pipes with tiny spec files.

Done when: every row of every table is a passing unit test; no function throws or returns NaN for 0, negative or huge numbers; `ng build` passes.
Finish with the final report from section 6.
```

---

## T4: `media-thumbnail`

**Wait for:** M2 (needs `thumb-box`, `checkbox`, `tag`, `formatDuration`, `formatSize`). **Branch:** `p3/t4-media-thumbnail`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Playlist-Select-Page-Spec.md`, `Down4More-Playlist-Options-Page-Spec.md`, `Down4More-Single-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 (primitive API contract) of docs/team/P3-instructions.md, then Shared spec 4.6.7, 4.6.9, 4.6.10 (including the compact row) and 6.5, Decisions spec 2.4 (sizeOverride), Select spec section 2, Options spec section 2 and Single spec section 2.1.

TASK: build d4m-media-thumbnail in src/app/shared/components/media-thumbnail/ (.ts/.html/.scss/.spec.ts, index.ts). Use d4m-thumb-box, d4m-checkbox, d4m-tag from '@shared/ui/...' and formatDuration / formatSize from '@core/utils'.

API (Shared 6.5 plus Decisions 2.4):
- inputs: item (MediaItem, required), variant 'single' | 'pre-select' | 'option-select' (required), selected = model(false), showCheckbox = true, active = false (reserved), appliedTag: string | null = null, loading = false, sizeOverride = input<number | null | undefined>(undefined) (when not undefined it is used INSTEAD of item.sizeBytes; null shows '—').
- output: activate (string id, reserved).
Variants:
- single: 150x100 thumb box + detail block: "Video: <title>" clamped to 2 lines, channel, file size, duration. Not a button. Look per Single spec section 2.1 / Shared 6.5.
- pre-select: a row of height var(--row-height) 82: checkbox, thumb box 84x56, title (ONE line with ellipsis, full title in the title attribute), then one meta column: label "Duration" (13/700 muted) over the value (15/700). NO file size. The whole row is one <button type="button" aria-pressed> that toggles `selected`. Because a button cannot contain a button, use <d4m-checkbox [presentational]="true"> inside it.
- option-select: same row, plus a d4m-tag under the title (variant 'default' with text "Default" when appliedTag is null, otherwise variant 'applied' with the appliedTag text), and TWO meta columns "File size" and "Duration" with a 1px --color-border divider (each min-width 62). Whole row is one <button aria-pressed> that toggles `selected`. When showCheckbox is false the checkbox is NOT rendered but the row still toggles.
- Row look 4.6.10: padding 0 16px 0 14px, gap 14, radius var(--radius-panel), fill --color-bg, border 1px transparent, hover border --color-border, selected: border --color-primary and fill = --color-selected tint over --color-bg. Height EXACTLY var(--row-height).
- Compact layout (@include compact, section 3 rule): padding 0 12px 0 10px, gap 12; the meta columns and divider are REPLACED by one muted line under the title: option-select "40 MB · 12:48" (12/700 --color-text-muted, '—' for an unknown part), pre-select only "12:48"; on option-select the tag sits under that line. Thumb box stays 84x56.
- Missing thumbnailUrl shows the neutral placeholder; durationSec null shows '—'; loading shows a skeleton.
Clicking the row sets `selected` to the opposite (the page listens with (selectedChange)).

Unit tests: the three variants render from one MediaItem; row height token; click toggles in option-select and in pre-select; with showCheckbox=false the row still toggles; sizeOverride beats item.sizeBytes; null size shows '—'; tag text for null and for a string.
Done when: "Done when" of 6.5 passes; `ng build` passes.
Finish with the final report from section 6.
```

---

## T5: `download-info`

**Wait for:** M2 (needs `progress-bar`, `thumb-box`, `checkbox`, all formatters, icons). **Branch:** `p3/t5-download-info`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-History-Page-Spec.md`, `Down4More-Format-Utils-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P3-instructions.md, then Shared spec 4.5 (rows 8 and 9), 4.6.8, 4.6.10 and 6.6, Downloads spec sections 2, 2.1, 5, 6 and 7, and History spec section 2.3 and 7 (this IS the history variant spec).

TASK: build d4m-download-info in src/app/shared/components/download-info/ (.ts/.html/.scss/.spec.ts, index.ts). Use d4m-progress-bar, d4m-thumb-box, d4m-checkbox, d4m-icon and the formatters (formatSize with 'mb', formatSpeed, formatEta, formatWhen) from '@core/utils'.

API: inputs item (DownloadItem, required), variant 'small' | 'big' | 'history' (required), selectable = false, selected = model(false). Output: action (DownloadActionEvent { type, id }), ONE output for every button.

Variants:
- small: a <div> row (it contains buttons) height var(--row-height): checkbox (when selectable), thumb box 84x56, name block (title one line ellipsis with the percent 13/800 --color-primary on the right; d4m-progress-bar 6px; meta line 12/700 muted: `speed`, `x / y MB` (formatSize 'mb'), `ETA <eta>`), then icon buttons (.btn--icon.btn--sm 34x34). Compact layout: NO thumb box, meta line is `speed · ETA` only.
- big: renders ONLY its content (the page wraps it in d4m-panel): preview box (d4m-thumb-box size preview), "Video" and "Channel" on the left, a Format / Quality / Bit-rate label-value table on the right (12/700 labels, 13/700 values), then percent (20/800), speed, size, ETA, a full-width progress bar with pause and cancel icon buttons. Compact layout: one column as in Shared 6.6 (preview, Video/Channel, the table as three rows, percent+speed+size+ETA wrapping, bar with buttons).
- history: EXACTLY History spec 2.3: solid green or red row from the status (history tokens), thumb 84x56 without border (bordered=false), name + date (formatWhen(item.finishedAt)), Quality / Format / Size columns (Quality shows "Audio" when settings.mode is 'audio-only'; Size = formatSize(item.totalBytes ?? item.sizeBytes ?? null)), white chip "Succeeded" (status done) or "Failed" (with title attribute = item.error and visually hidden text ": <error>"), actions area width 76 with Retry (failed only) and Remove, using .btn--icon.btn--sm.btn--on-color. Hide the Format column under 860px (documented exception) and the whole meta block in the compact layout (chip 84 wide). Focus ring white (--color-on-history).
Actions by status (button rendered only when valid): queued -> cancel; downloading -> pause, cancel; paused -> resume, cancel; processing -> NO buttons (bar full, fill var(--color-apply), text "Processing…"); done -> dismiss; failed -> error text, retry, dismiss. In 'small' and 'big' the last button emits 'dismiss' (aria-label "Dismiss"); only the 'history' variant emits 'remove'. Every icon button carries the title in its aria-label ("Pause <title>", "Retry <title>", "Remove <title> from history"...).
Rules: progress clamped 0..100; the bar has role="progressbar" via d4m-progress-bar with label "Progress of <title>"; missing speed, ETA or total shows '—'; no timers; no layout shift between statuses.

Unit tests: every status x variant renders; each button emits the right { type, id }; processing has no buttons; history chip text and failed error text; clamping.
Done when: "Done when" of 6.6 passes; `ng build` passes.
Finish with the final report from section 6.
```

---

## T6: `trim-video`

**Wait for:** M2 (`toggle-panel` from P2 T3). **Branch:** `p3/t6-trim-video`.
**Attach:** `Down4More-Single-Page-Spec.md`, `Down4More-Single-Page-Style-Notes.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P3-instructions.md, then Single spec sections 3 (rule 2), 4 (expand behaviour), 5.1 and 5.3, then ALL of Down4More-Single-Page-Style-Notes.md. The Style Notes hold every dimension and colour of this panel; use them exactly and do not invent values. Key numbers: panel padding 20px 24px (d4m-toggle-panel padding="roomy", fill --color-bg, NO border); grid 330px 1fr, gap 24, align-items stretch; left column gap 14; segment box radius 14, 1px --color-border, padding 14, gap 14; rail 2px wide with a 12px dot; segment fields 42 high, gap 10; add button 40x40; preview min-height 200, radius 14, icon 44 (its OWN box, do not use d4m-thumb-box); timeline row height 16, gap 14, track 2px, knobs 14x14. Colours come from the tokens in Style Notes section 6; the --trim-* tokens already exist in styles.scss (P1 T1), do not redefine them and do not edit styles.scss. At the end, check your result against the measured sizes in Style Notes section 8 (with 3 segment fields the panel is 306px tall, the left and right columns 266px, the segment box 330 x 226, the preview 236 high)."

TASK: build d4m-trim-video in src/app/features/single/components/trim-video/ (.ts/.html/.scss/.spec.ts, index.ts), built on d4m-toggle-panel (label "Trim Video"). Inputs: open = model(false), durationSec: number | null, segments = model<TrimSegment[]>([]). (TrimSegment is in '@core/models'.)
Behaviour (spec 5.3):
- durationSec null: the switch is disabled with the tooltip "Duration unknown" (title attribute).
- When trim is on and there are no segments, the list shows ONE field "All segments" meaning the whole video; the timeline knobs sit at both ends and the labels show 00:00:00 and the duration. (Do not add a real segment to `segments` until the user changes something.)
- Left column: a segment box with a vertical rail and the fields ("All segments", "Segment 2", "Segment 3"...). Each field shows its range as "HH:MM:SS to HH:MM:SS". The selected field is the one the timeline edits. A circular add button (.btn.btn--circle, 40x40, plus icon 18, aria-label "Add segment"; its fill, border and icon colour come from var(--trim-add-bg), var(--trim-add-border), var(--trim-add-fg) so dark mode looks right) at the bottom right adds a new segment (default: the whole video). A small x removes a segment once there is more than one (aria-label "Remove segment N").
- Right column: preview box (its own div, placeholder with a play icon 44 from d4m-icon; fill var(--box-bg), icon var(--trim-preview-fg), border var(--trim-preview-border)) and under it the timeline: start time label, a track with two round knobs, end time label (format HH:MM:SS). Knobs drag with pointer events and also move with the arrow keys (role="slider", aria-valuemin/max/now, aria-label "Segment start" / "Segment end"). A knob can never cross the other (startSec < endSec, minimum gap 1 second). Clamp to 0..durationSec.
- Compact layout: the two columns stack (segment box first, then preview and timeline).
- Turning trim off keeps the segments in memory; the page decides what to send.
- Add a small pure helper file formatClock.ts (seconds -> 'HH:MM:SS') in this component folder with a test (it is NOT in core/utils because it is local).
If time is short, you MAY first deliver a minimal version (switch, "All segments" field, static timeline, add button) and say so under Questions; but the segments model and unknown-duration behaviour are mandatory because Single depends on them.

Unit tests: unknown duration disables the switch; "All segments" default; add and remove segment; knobs cannot cross; keyboard moves a knob.
Done when: `ng build` passes and the component works inside the Single grid (collapsed quarter cell, expanded full width). Sizes match Style Notes section 8 in both themes (check with the browser inspector: segment box 330 x 226, field 276 x 42, add button 40 x 40, knob 14 x 14, preview min-height 200).
Finish with the final report from section 6.
```

---

## T7: History page, `search-bar` and Settings placeholder

**Wait for:** M3 (`item-container`, `download-info`, `HistoryService`, `DownloadService`). **Branch:** `p3/t7-history`.
**Attach:** `Down4More-History-Page-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-App-Routing-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P3-instructions.md, then docs/specs/Down4More-History-Page-Spec.md COMPLETELY (this is your page spec) and Routing spec section 7 (Settings placeholder).

TASK: OVERWRITE the two stubs and create the search bar:
1. src/app/features/history/history.component.ts/.html/.scss: use the code in spec sections 4.1 as the starting point (query, shown, countText, reload, onAction with HistoryService.drop and the spoken notice). Use d4m-page-container size="lg" padding="split", d4m-search-bar in the [header] slot, d4m-item-container (selectable=false, visibleRows 5) with d4m-download-info variant="history", the [empty] states (loading, error with "Try again", empty, no match), the footer count. IMPORTANT: after Retry or Remove succeeds, focus moves to the search box (spec section 5).
2. src/app/features/history/components/search-bar/ (d4m-search-bar, .ts/.html/.scss/.spec.ts, index.ts): spec 4.2 and 2.2. value = model(''), placeholder 'enter a name…', label 'Search history'. role="search" container, Search button that focuses the input, Escape clears, updates on every keystroke. Expose a way for the page to focus the input (a public focus() method, call it through viewChild).
3. src/app/features/settings/settings.component.ts: OVERWRITE the stub with the placeholder exactly as Routing spec section 7.
Use HistoryService and DownloadService from '@core/services/...'.

Done when: spec section 10 passes against MockApiService (8 design rows with the right colours, filter, Escape, Retry sends the item back to Downloads and the row leaves History, Remove deletes the record, 70 entries scroll smoothly, loading/error/empty states). `ng build` passes.
Finish with the final report from section 6.
```

---

## T8: `/dev` demos for your components (M5)

**Wait for:** M3. **Branch:** `p3/t8-demos`.
**Attach:** `Down4More-Dev-Playground-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-Single-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P3-instructions.md and docs/specs/Down4More-Dev-Playground-Spec.md sections 4 and 5.

TASK: OVERWRITE the stub demo components you own in src/app/dev/demos/ (keep file and class names): media-thumbnail.demo, download-info.demo, search-bar.demo, trim-video.demo. Use the REAL components and MOCK_MEDIA_ITEMS / MOCK_DOWNLOADS / MOCK_HISTORY from '@core/mocks/mock-data'. media-thumbnail: every variant; selected / unselected; default tag and an applied tag ("1080p · mp4"); showCheckbox false; loading; no thumbnail; unknown duration; unknown size; very long title; sizeOverride; and a 390px wide wrapper to show the compact row. download-info: every status (queued, downloading, paused, processing, done, failed) in small, big and history, selectable and not, long title, no thumbnail, unknown size, plus 390px wrappers for the compact versions; show the emitted action text under each. search-bar: empty, with text, long text. trim-video: collapsed, "All segments", 3 segments, unknown duration.

Done when: every state is visible at /dev/<id>; `ng build` passes.
Finish with the final report from section 6.
```
