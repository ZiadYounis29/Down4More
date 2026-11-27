# Down4More — P5 instructions

> **Your job:** ThemeService, nav-buttons, nav-bar and shell, Playlist flow (guards, state, Select, Options).
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

# 7. P5 turns

Your order: **T1 → T2 → T3 → T4 → T5 → T6 → T7**. You own the app shell (theme, nav bar, buttons) and the whole Playlist flow (guards, state service, Select page, Options page). The Options page is the heaviest page of the app: save your energy for T4 to T6.

---

## T1: `ThemeService`

**Wait for:** M1. **Branch:** `p5/t1-theme`.
**Attach:** `Down4More-Core-Shell-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md, then docs/specs/Down4More-Core-Shell-Spec.md section 1 (the ThemeService code).

TASK: create src/app/core/services/theme.service.ts exactly as in the spec: `Theme` type, `@Injectable({ providedIn: 'root' })`, `theme = signal<Theme>(initial())`, an effect that sets document.documentElement.dataset['theme'] and saves to localStorage under the key 'd4m-theme' (inside try/catch), `toggle()`, and the initial value from localStorage or prefers-color-scheme. This is the ONLY file in the app allowed to use localStorage.
Also create theme.service.spec.ts: toggle flips the value; the dataset attribute follows; a saved 'dark' value is restored on a new instance; localStorage failure does not throw.

Done when: tests pass; `ng build` passes.
Finish with the final report from section 6.
```

---

## T2: `nav-buttons` and presets

**Wait for:** M1b (`d4m-icon` on main). **Branch:** `p5/t2-nav-buttons`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Downloads-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P5-instructions.md, then Shared spec 4.5 (all buttons), 4.7 and 6.3 (nav-buttons), and Downloads spec section 9 (NavButton gains `pressed` and `title`).

TASK: build d4m-nav-buttons in src/app/shared/components/nav-buttons/: nav-buttons.component.ts/.html/.scss/.spec.ts, nav-buttons.presets.ts, index.ts (export the component, NavButton, the presets). Use the GLOBAL button classes from styles.scss and d4m-icon from '@shared/ui/icon'.

- Export `interface NavButton { id: string; label: string; variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'apply'; side?: 'start' | 'end'; icon?: IconName; disabled?: boolean; loading?: boolean; hidden?: boolean; pressed?: boolean; title?: string }`.
- Inputs: buttons (NavButton[], required), size 'sm' | 'md' | 'lg' (default 'md'), fullWidth: boolean | 'compact' (default false). Output: pressed (string, the button id).
- Rendering: each button is <button type="button" class="btn ..."> with classes from variant (default 'secondary': primary -> btn--primary, secondary -> btn--secondary, ghost -> btn--ghost, danger -> btn--danger, apply -> btn--apply) and size (sm -> btn--sm, md -> none, lg -> btn--lg). Order = array order. Buttons with side 'start' are left-aligned and 'end' are right-aligned (flex row, start group left, end group right; with only 'end' buttons the row is right-aligned). Hidden buttons are not rendered. Icon: `chevron-left` is shown BEFORE the label, every other icon AFTER it; icon size: sm 14, md 20, lg 22. `pressed` sets aria-pressed (only when it is defined). `title` sets the native title attribute. `loading` adds `btn--loading` (spinner) plus aria-busy and the button NEVER emits; `disabled` never emits either (use the real disabled attribute).
- fullWidth true: every button fills its row (width 100%, flex 1). fullWidth 'compact': it fills the row ONLY in the compact layout (@include compact, after @use 'styles/breakpoints' as *;).
- Presets file with factories returning NavButton: navBack (id 'back', label 'Back', ghost, start, chevron-left), navNext ('next','Next', primary, end, chevron-right), navFetch ('fetch','Fetch', primary, end, arrow-down), navDownload ('download','Download', primary, end, arrow-down), navApply ('apply','Apply', variant 'apply', end, check).
Unit tests: render order, start/end, hidden, loading and disabled never emit, pressed output id, aria-pressed, fullWidth classes, presets values.

Done when: "Done when" of 6.3 passes (a new page can add a button by adding one object); looks right at sizes sm, md, lg in both themes; `ng build` passes. Tell the team "nav-buttons is on main" after merge.
Finish with the final report from section 6.
```

---

## T3: `nav-bar` and the app shell

**Wait for:** M2 (`ThemeService` is yours; also needs `logo` from P2 T2 and `icon`). **Branch:** `p5/t3-shell`.
**Attach:** `Down4More-Core-Shell-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md, then docs/specs/Down4More-Core-Shell-Spec.md COMPLETELY and Shared spec 4.6.1 and 4.6.12.

TASK:
1. src/app/core/layout/nav-bar/: nav-bar.component.ts/.html/.scss/.spec.ts (+ index.ts). Use the code in the spec as is: NavItem, NAV_ITEMS (Downloads /downloads, History /history, Settings /settings), selector d4m-nav-bar, imports RouterLink, RouterLinkActive, LogoComponent (from '@shared/components/logo'), IconComponent (from '@shared/ui/icon'), ThemeService; the toggle button with aria-label that follows the theme; the logo link to "/" with aria-label "Down4More home"; `routerLinkActive="on"` and `ariaCurrentWhenActive="page"`; the SCSS from the spec using @include compact (add `@use 'styles/breakpoints' as *;`).
2. Overwrite src/app/app.component.ts/.html/.scss with the shell exactly as the spec: `.shell` (min-height 100vh, padding 20px 32px 48px, background --color-bg, text --color-text, font --font-body) containing <d4m-nav-bar /> and <main class="shell__main"><router-outlet /></main>; main has margin-top 28; compact padding 16px 16px 32px. The component imports RouterOutlet and NavBarComponent.
Tests: nav-bar renders 3 links, exactly one active on /history (use RouterTestingHarness or provideRouter with dummy routes), none active on '/', toggle calls ThemeService.toggle and changes aria-label and icon, Tab order logo -> links -> toggle.

Done when: the "Done when" of spec section 1 passes (toggle flips the whole app, survives a reload, icon and aria-label change; focus ring visible; looks right in both themes). `ng build` passes.
Finish with the final report from section 6.
```

---

## T4: Guards and `PlaylistStateService`

**Wait for:** M2 (needs `FetchInfoService` from P4 T1 and the utils from P3 T1 to T3). **Branch:** `p5/t4-state`.
**Attach:** `Down4More-Playlist-Flow-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-App-Routing-Spec.md`, `Down4More-Playlist-Options-Page-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md, then Flow spec sections 3 and 4 completely, Decisions spec section 2.3 (sizeFor and the new summary), Per-Video spec section 2.1 (wins over Flow spec 4 where they differ), and Routing spec sections 2 and 5.

TASK: OVERWRITE the stub guards and create the state service. Files:
1. src/app/features/playlist/guards/has-fetch-result.guard.ts: hasFetchResultGuard (CanActivateFn): passes when FetchInfoService.lastResult() is set and has at least 1 item, else returns router.parseUrl('/').
2. src/app/features/playlist/guards/has-chosen.guard.ts: hasChosenGuard EXACTLY as the code in Flow spec section 3 (it checks lastResult() itself FIRST).
3. src/app/features/single/guards/is-single-kind.guard.ts: isSingleKindGuard EXACTLY as the code in Routing spec section 2.
4. src/app/features/playlist/services/playlist-state.service.ts: the service of Flow spec section 4 (linkedSignal everywhere: chosenIds, selectedIds, draft, appliedDraft, applied; computed items, catalog, failedCount, chosenItems, isGlobal, targetItems, defaults, dirty; tagFor, settingsFor, apply, requests). Angular 19+ `linkedSignal` from '@angular/core'. Apply the Decisions-spec changes:
   - `sizeFor(id: string): number | null` per Decisions 2.3 (never applied -> item.sizeBytes ?? null; applied -> estimateSizeBytes(item.sizeBytes ?? null, applied, defaults())).
   - `summary` reads through sizeFor (Decisions 2.3 code).
   - (Per-Video spec 2.1, wins over the line above) `defaults` is REPLACED by `private defaultsFor(item)` = defaultDownloadSettings(this.catalogFor(item)). Add `catalogFor(item)` (item.catalog ?? catalog()) and `effectiveCatalog` (computed: the item's own catalog when targetItems has exactly one row, otherwise catalog()). `settingsFor` and `sizeFor` use defaultsFor(item). apply() and requests() stay UNCHANGED: they stamp and send the draft as picked, the per-video fallback is backend work.
   Imports from '@core/utils/...': default-download-settings, settings-tag, same-settings, estimate-size, format-size; FetchInfoService from '@core/services/fetch-info.service'.
5. src/app/features/playlist/services/playlist-state.service.spec.ts with ALL the tests listed at the end of Flow spec section 4 (reset on a new lastResult; chosenItems follows chosenIds; isGlobal and targetItems in Global and with 2 rows ticked; apply() in Global stamps all, with ticks stamps only those, and clears dirty; dirty turns true when the draft changes and false after apply(); requests() uses applied settings and falls back to defaults; summary text for Global, selected, 1 video and no known sizes), PLUS: sizeFor returns the original size for a never-applied row, a scaled size after Apply (720p video+audio 192 kbps on a 40 MB item is about 23.4 MB), and null for sizeBytes null; the summary total equals the sum of the displayed row sizes for a mix of applied and un-applied rows. Also (Per-Video spec section 5): effectiveCatalog is the item's own catalog for one target row and catalog() for two or more rows and for Global with several; a video without catalog uses catalog(); the default and size baseline of an un-applied row come from its own catalog. Also write small spec tests for the three guards (no result -> '/', result but nothing chosen -> '/playlist/select', single-kind check).
Do NOT edit playlist.routes.ts (it is final) or any model.

Done when: all tests pass; `ng build` passes.
Finish with the final report from section 6.
```

---

## T5: Playlist Select page

**Wait for:** M3 (`item-container`, `media-thumbnail`, `nav-buttons`, `page-container`) and T4. **Branch:** `p5/t5-select`.
**Attach:** `Down4More-Playlist-Select-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md, then docs/specs/Down4More-Playlist-Select-Page-Spec.md COMPLETELY (this is your page spec). Flow spec section 4 describes the state service you wrote in T4.

TASK: OVERWRITE the stub src/app/features/playlist/select/playlist-select.component.ts and create .html and .scss. Use the code in spec section 2.1 as is (PlaylistSelectComponent: state, router, buttons = [{ ...navNext(), disabled: no ticks }], failedText, onPressed('next') -> router.navigate(['/playlist','options'])). Template: visually hidden <h1>, d4m-page-container size="md", the failed notice in the [header] slot (role="status"), d4m-item-container (selectable, visibleRows 5, selectAllLabel "Select all", [(selectedIds)]="state.chosenIds") with d4m-media-thumbnail variant="pre-select" in the row template, and <d4m-nav-buttons footer fullWidth="compact">. The SCSS rule for .sel__notice from the spec. The compact layout is section 2.2 (the components handle it; check it). There is NO Back button (decision in the spec).
Write a small spec test for the component: all rows ticked on open, Next disabled with 0 ticked, Next navigates, notice shows only when failedCount > 0.

Done when: the "Done when" list of spec section 6 passes against MockApiService (all 9 ticked, summary text, Select all, Next disabled with none, refresh goes Home, 300 rows scroll, compact layout at 390px). `ng build` passes.
Finish with the final report from section 6.
```

---

## T6: Playlist Options page

**Wait for:** M3 (`download-options` from P2 T4 must be merged) and T4. **Branch:** `p5/t6-options`.
**Attach:** `Down4More-Playlist-Options-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md, then docs/specs/Down4More-Playlist-Options-Page-Spec.md COMPLETELY (this is your page spec), Decisions spec sections 2.3 and 2.4, and Flow spec section 4.

TASK: OVERWRITE the stub src/app/features/playlist/options/playlist-options.component.ts and create .html and .scss. Use the code in spec section 3 as the starting point (state, DownloadService, Router, starting, message, applyButtons = [navApply()], downloadButtons with label `Download (N)` and loading, onPressed for apply and download, startDownload blocked while state.dirty() with the message "Press Apply to save your changes first.", success -> router.navigate(['/downloads']), failure -> "Couldn't start the downloads. Try again."). Template and SCSS as in spec section 3 plus the compact rules of spec 2.2 (`.opt { height: auto }` in the compact layout; Download full width and last).
CHANGES from the Decisions spec (they win over the Options spec text):
- the bit-rate panel is a SELECT (that is inside d4m-download-options, nothing to do here) and the default is 192 kbps, not 300;
- in the row template pass `[sizeOverride]="state.sizeFor(item.id)"` to d4m-media-thumbnail (variant "option-select") in addition to [selected], (selectedChange)="toggle()", [showCheckbox]="!state.isGlobal()" and [appliedTag]="state.tagFor(item.id)";
- the list summary is `state.summary()` (already built from sizeFor in T4);
- the options panel gets `[catalog]="state.effectiveCatalog()"`, NOT `state.catalog()`: one target row shows that video's own options, several rows or Global show the main catalog (Per-Video spec 2.3). Apply and Download are never disabled for this reason and there is no extra status text;
Grid in the side panel: `grid-template-areas: "mode mode" "quality format" "captions captions" "bitrate apply"` with d4m-download-options layout="contents" [(settings)]="state.draft" [catalog]="state.effectiveCatalog()". Apply and its status line ("Unsaved changes" in --color-accent when dirty, otherwise "Settings applied" muted, aria-live polite) sit in the `apply` cell.
Write a spec test: opens in Global with Download (N) correct; clicking rows leaves Global; the panel catalog is the row's own catalog for one ticked row and the main catalog for two or more; Apply stamps only target rows and the tags read like "1080p · mp4", "720p · mkv · video only", "mp3 · 192k"; Download is blocked while dirty; Download sends one request per target row then navigates to /downloads; a failure keeps the page as it was.

Done when: the "Done when" list of spec section 7 passes against MockApiService, plus the Decisions-spec items: an un-applied row shows the original size, an applied row shows the re-estimated size, and the summary total matches the displayed rows. `ng build` passes.
Finish with the final report from section 6.
```

---

## T7: `/dev` demos for your components (M5)

**Wait for:** M3. **Branch:** `p5/t7-demos`.
**Attach:** `Down4More-Dev-Playground-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-Core-Shell-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P5-instructions.md and docs/specs/Down4More-Dev-Playground-Spec.md sections 4 and 5.

TASK: OVERWRITE the stub demo components you own in src/app/dev/demos/ (keep file and class names): nav-buttons.demo and nav-bar.demo. nav-buttons: each size (sm, md, lg) with each variant (primary, secondary, ghost, danger, apply), with and without icon, side start and end together, disabled, loading, hidden, pressed (with the title "Resume all"), fullWidth true, fullWidth 'compact' (inside a 390px wrapper), and a text line under each demo showing the last emitted id. nav-bar: the real <d4m-nav-bar /> inside a wrapper; note in a caption that the active link depends on the current route (hover/focus: check manually).

Done when: every state is visible at /dev/<id>; `ng build` passes.
Finish with the final report from section 6.
```
