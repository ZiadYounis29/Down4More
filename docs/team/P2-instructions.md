# Down4More — P2 instructions

> **Your job:** Form controls, logo, download-options, Single page.
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

# 7. P2 turns

Your order: **T1 → T2 → T3 → T4 → T5 → T6**. You own the form controls, the options panel and the Single page.

---

## T1: `toggle`, `segmented-control`, `select`

**Wait for:** M1. **Branch:** `p2/t1-controls`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Project-Tree.md`, this file.

**Prompt:**

```text
Read section 3 and section 4 ("Primitive API contract") of docs/team/P2-instructions.md, then Shared spec sections 4.3, 4.5, 4.6.3 to 4.6.5, 4.7 and 5.

TASK: build three primitives under src/app/shared/ui/, each with .ts/.html/.scss/.spec.ts and index.ts. Follow the API contract table EXACTLY.

0. First create src/app/shared/ui/option.model.ts exporting `interface Option<T> { value: T; label: string; disabled?: boolean }`. Re-export Option from the index.ts of select and segmented-control.
1. toggle (d4m-toggle): look in 4.6.5. Track 46x26 pill. Light theme: transparent track, 2px --color-primary border, knob 18px at 2px, --color-primary. Dark theme: track --color-surface, 1px --color-border, knob 20px at 3px, --color-text-muted. The two themes differ only through tokens, so use --field-border / --field-bg style tokens plus the on-state rule: ON (both themes) = track fill --color-primary, knob fill --color-bg, knob at left 22px. If you cannot express light vs dark with the existing tokens alone, add the difference with the :root[data-theme='dark'] selector INSIDE the component scss (this is the one place allowed). Text to the right, gap 10, 14/700 --color-text-muted, "Off"/"On", shown when showText is true. Element: <button type="button" role="switch" [attr.aria-checked]="value()" [attr.aria-expanded]="expanded()">, aria-expanded only when `expanded` is not null. Click toggles `value`. Disabled opacity .38.
2. segmented-control (d4m-segmented-control): group `<div role="group">` of `.pill` buttons (global class in styles.scss) in a flex row, gap 10, wrap, centred. Exactly one pill has aria-pressed="true". Clicking sets `value`. Respects option.disabled and the disabled input.
3. select (d4m-select): look in 4.6.3: height var(--control-height) 42, padding 0 14px (right 36), radius var(--radius-control), 15/600, border var(--field-border), fill var(--field-bg), a native <select> with appearance none and a custom 16px chevron (inline SVG) at right 12, top 13, colour --color-text-muted. Map option values by INDEX (the DOM value is the index) so number and null values work. Disabled: opacity .38, cursor not-allowed. aria-label from `label`.
Focus ring on all three (rule in section 3). Unit tests for each (value change via click/change event, disabled, aria attributes).

Done when: all states look right in light and dark; `ng build` passes.
Finish with the final report from section 6.
```

---

## T2: `progress-bar` and `logo`

**Wait for:** M1. **Branch:** `p2/t2-progress-logo`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Downloads-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P2-instructions.md, then Shared spec 4.6.8, 6.2 and 6.6 (the progress-bar rules).

TASK:
1. src/app/shared/ui/progress-bar/ (d4m-progress-bar, .ts/.html/.scss/.spec.ts, index.ts). Inputs per the contract table: value (number, clamped to 0..100), variant 'default' | 'processing', label (aria-label). Look in 4.6.8: height 6, pill, track --color-border, fill --color-primary (variant 'processing': fill --color-apply), overflow hidden. role="progressbar", aria-valuenow, aria-valuemin 0, aria-valuemax 100, aria-label from `label`. NOT a live region. The fill width animates only with a width transition of 150ms (no layout shift).
2. src/app/shared/components/logo/ (d4m-logo, .ts/.html/.scss/.spec.ts, index.ts): COPY the exact implementation from Shared spec 6.2 (the SVG polygons, the template, the scss, the ts). Inputs variant 'mark' | 'wordmark' (default 'mark'), height (default 46), label ('Down4More'). It is not a link.

Done when: progress-bar clamps -10 and 150; processing variant uses the amber fill; the wordmark scales with the parent font-size; `ng build` passes.
Finish with the final report from section 6.
```

---

## T3: `toggle-panel`, `file-name`, `frame-size` stub

**Wait for:** M2 for `panel` and `toggle` (P1 T5 and your T1). **Branch:** `p2/t3-single-parts`.
**Attach:** `Down4More-Single-Page-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P2-instructions.md, then docs/specs/Down4More-Single-Page-Spec.md sections 4, 5.1 and 5.2 and Shared spec 4.6.2 and 4.6.3. Use d4m-panel, d4m-toggle from '@shared/ui/...'.

TASK: create three Single-only components under src/app/features/single/components/ (each with .ts/.html/.scss/.spec.ts and index.ts; they follow the same rules as shared components: dumb, OnPush, tokens only):
1. toggle-panel/ (d4m-toggle-panel): spec 5.1. Inputs label (required), open = model(false), disabled (false). Slot [expanded] shown only when open is true. Collapsed: a d4m-panel with the label (13/700 muted) on the left and the d4m-toggle on the right (flex, space-between, centred). Expanded: the panel stacks: header row (label and switch side by side, gap 14, switch text "On") then the [expanded] content below with gap 14. The d4m-toggle gets [expanded]="open()". Disabled dims the panel (.38). Allow a `padding` input ('default' | 'roomy') that is passed to d4m-panel (Trim uses roomy).
2. file-name/ (d4m-file-name): spec 5.2. Inputs value = model(''), extension (string), fallback (string). A d4m-panel with the label "File name" over a text input (look 4.6.3: height 42, radius 12, field tokens). The extension is a muted non-editable suffix inside the field at the right (`.mp4`). The input has a <label for>. If value is empty the placeholder shows the fallback. The typed value never contains the extension.
3. frame-size/ (d4m-frame-size): a d4m-toggle-panel with label "Frame Size", `open = model(false)`. Its [expanded] content is the PLACEHOLDER box (min-height 200, dashed 2px --color-border, centred muted text "Frame size options go here"). No other behaviour.
Unit tests for each.

Done when: collapsed and expanded states render; frame-size placeholder shows when open; `ng build` passes.
Finish with the final report from section 6.
```

---

## T4: `download-options` (wrapper + 5 children)

**Wait for:** M2 (needs `panel`, `apply-option-rules` and `default-download-settings` from P3). **Branch:** `p2/t4-download-options`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Playlist-Options-Page-Spec.md`, `Down4More-Single-Page-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P2-instructions.md, then Shared spec 6.4 and 4.6.2 to 4.6.4, Decisions spec section 1 (bit-rate is now a SELECT from catalog.bitrates), Options spec 2.1 and 4.4, Per-Video spec 2.2, Single spec 3 (the "area-<field>" class names).

TASK: build src/app/shared/components/download-options/ (wrapper) and its five children, each with .ts/.html/.scss/.spec.ts and index.ts:
  download-options/download-options.component.*  (selector d4m-download-options)
  download-options/captions/        (d4m-captions)
  download-options/video-audio-select/ (d4m-video-audio-select)
  download-options/quality/         (d4m-quality)
  download-options/format/          (d4m-format)
  download-options/bitrate/         (d4m-bitrate)

Children are dumb and know nothing about each other. Each has `value = model<...>()`, `disabled`, optional `label` override. All are built from d4m-select / d4m-segmented-control:
- video-audio-select: MediaMode, segmented control with options video+audio / audio only / video only (labels "video+audio", "audio only", "video only").
- quality: string | null, input options: string[], a select.
- format: string, input options: string[], a select.
- bitrate: number | null, input options: number[] (catalog.bitrates). A SELECT with option labels like "96 kbps" (NOT a number input).
- captions: CaptionSettings. Two selects "off"/"on": "Caption" (captions.enabled) and "Separate file" (captions.separateFile), side by side with a 1px vertical divider (--color-border), in one panel. Separate file is editable only when captions.enabled is true; in audio-only mode (when the wrapper passes `lockSeparate` = true) it is shown "on" and locked. Add an input `lockSeparate = input(false)`.

Wrapper d4m-download-options:
- Inputs: settings = model.required<DownloadSettings>(), catalog (required DownloadOptionsCatalog), disabled (false), hiddenFields ('mode'|'quality'|'format'|'bitrate'|'captions')[] ([]), columns 1|2 (2), layout 'stacked' | 'contents' ('stacked').
- Every child change goes through ONE method that does `settings.set(applyOptionRules({ ...settings(), ...patch }, catalog()))`. applyOptionRules(settings, catalog) is a pure function from '@core/utils/apply-option-rules' (P3). Also add an effect that normalises `settings` against a new `catalog` once (only sets when the normalised value differs, to avoid loops). It must run on EVERY catalog change, because the Options page swaps between one video's catalog and the main catalog while the page is open (Per-Video spec 2.2); applyOptionRules then also clamps quality.
- Derived state from the mode (Shared 6.4 table, Options spec 4.4): audio-only -> quality child disabled and shows no value, format options = catalog.audioFormats; video-only -> bit-rate child disabled; otherwise format options = catalog.videoFormats. Disabled fields stay visible and dimmed so the layout never jumps. Captions stay enabled in every mode.
- Each child is wrapped in a d4m-panel with a label: quality "Quality", format "Format", bit-rate "Bit-rate", captions has its own two labels, mode pills have no label.
- layout 'contents': host is display: contents. Each panel gets `grid-area: <field>` AND a class `area-<field>` (mode, quality, format, bitrate, captions) so the page grid can place it by name. DOM order MUST be: captions, mode, quality, format, bitrate.
- layout 'stacked': the wrapper is its own grid (columns input): mode full width, quality + format side by side, captions, bit-rate.
- No compact rules inside the wrapper: the page grid decides; the mode pills wrap inside their panel.

Unit tests: switching mode never produces an invalid combination (audio-only nulls quality and picks the first audio format; video-only nulls bit-rate; going back restores quality and a bit-rate from the catalog); bit-rate options come from catalog.bitrates; hiddenFields hides a panel; contents layout adds the area classes in the right DOM order.

Done when: the "Done when" of Shared 6.4 passes (adapted: bit-rate is a select); `ng build` passes.
Finish with the final report from section 6.
```

---

## T5: Single page

**Wait for:** M3 (`download-options` is yours; also needs `media-thumbnail`, `trim-video`, `nav-buttons`, `FetchInfoService`, `DownloadService`, `sanitize-name`, `estimate-size`, `default-download-settings`). **Branch:** `p2/t5-single-page`.
**Attach:** `Down4More-Single-Page-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-App-Routing-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P2-instructions.md, then docs/specs/Down4More-Single-Page-Spec.md COMPLETELY (this is your page spec), Decisions spec section 2.5 (live size estimate) and Routing spec section 2 (guards; do not edit them).

TASK: OVERWRITE the stub src/app/features/single/single.component.ts and create single.component.html / single.component.scss. Follow spec sections 3.2 and 6 closely:
- Template: d4m-page-container size="lg" padding="split" containing the `.single` grid with the classes fs-on / trim-on, d4m-media-thumbnail variant="single" (class a-info), d4m-file-name (a-name), d4m-download-options layout="contents", d4m-frame-size (a-framesize), d4m-trim-video (a-trim), d4m-nav-buttons size="lg" (a-download), and the error message.
- SCSS: the desktop grid (4 columns) AND the compact grid (2 columns) with all four states for each, exactly as in spec 3.1 and the SCSS in 3.2. Use `@include compact` (with @use 'styles/breakpoints' as *;), never 720px. Style panels from download-options by the classes `.area-bitrate` etc.
- TS: result/item computed from FetchInfoService.lastResult(); catalog = computed(() => item().catalog ?? result().catalog) (Per-Video spec 2.4); settings = signal(defaultDownloadSettings(catalog())); fileName with sanitizeName; frameSizeOn, trimOn, segments; buildRequest() with extras (fileName + '.' + format, trim only when trimOn and there are segments, frameSize null); onPressed('download') calls DownloadService.start([request]) then navigates to /downloads; failure shows "Couldn't start the download. Try again."; Download disabled while trim has an invalid segment.
- NEW (from Decisions spec 2.5): `estimatedSize = computed(() => estimateSizeBytes(item().sizeBytes ?? null, settings(), defaultDownloadSettings(catalog())))` from '@core/utils/estimate-size' and pass `[sizeOverride]="estimatedSize()"` to d4m-media-thumbnail.
- Do NOT edit the Single guards (P5 owns them) and do not edit trim-video (P3 owns it).

Done when: spec section 10 passes: the 4 desktop and 4 compact grid states match the areas of 3.1, file-name suffix follows the format, the request has an array of 1, the size on the thumbnail changes live when quality / mode / bit-rate change. `ng build` passes.
Finish with the final report from section 6.
```

---

## T6: `/dev` demos for your components (M5)

**Wait for:** M3. **Branch:** `p2/t6-demos`.
**Attach:** `Down4More-Dev-Playground-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-Single-Page-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P2-instructions.md and docs/specs/Down4More-Dev-Playground-Spec.md sections 4 and 5.

TASK: OVERWRITE the stub demo components you own in src/app/dev/demos/ (the file names and class names already exist, keep them): toggle.demo, segmented-control.demo, select.demo, progress-bar.demo, logo.demo, download-options.demo, toggle-panel.demo, file-name.demo, frame-size.demo. Each uses the REAL component and shows one captioned case per state listed in its own spec: toggle (off, on, disabled, with aria-expanded), segmented-control (3 options each selected, disabled), select (default, disabled, long label, numeric values), progress-bar (0, 42, 100, processing, clamped), logo (mark at 46, wordmark at 3 font sizes), download-options (stacked with MOCK_CATALOG in each of the 3 modes, plus layout="contents" inside a 2-column grid like the Options page, plus hiddenFields, plus a narrow per-video catalog from MOCK_PLAYLIST_ITEMS[3].catalog (Per-Video spec section 3) that clamps a 2160p setting to 1080p), toggle-panel (collapsed, expanded, disabled), file-name (default, long name, empty), frame-size (collapsed, expanded placeholder; the demo page also shows the caption "Frame Size options not yet designed"). Use MOCK_CATALOG from '@core/mocks/mock-data'. Local toggle buttons are allowed for interactive demos.

Done when: every state of your components is visible at /dev/<id>; `ng build` passes.
Finish with the final report from section 6.
```
