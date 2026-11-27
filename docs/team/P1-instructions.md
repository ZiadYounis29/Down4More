# Down4More — P1 (leader) instructions

> **Your job:** Foundation, tokens, models, routing, primitives, page-container, item-container, Downloads page, final review.
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

# 7. P1 turns (leader)

Your order: **T1 → T2 → T3 (push, this is M1)** → **T4 (icon, merge alone = M1b)** → **T5 → T6** → **T7** → **T8** → **T9** → **T10 (review)**.
While your PRs wait, review and merge your teammates' PRs. Keep T1 to T3 fast: **everyone is blocked until M1 is on `main`.** For T1 to T3 you may commit straight to `main` (no PR) to save time.

---

## T1: Scaffold, tokens, global styles

**Wait for:** nothing. **Branch:** `p1/t1-scaffold` (or commit to `main`).
**Attach:** `Down4More-Project-Tree.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-App-Routing-Spec.md`, `Down4More-Core-Shell-Spec.md`, `Down4More-Single-Page-Style-Notes.md`, this file.

**Prompt:**

```text
You are the lead engineer building the foundation of an Angular app called Down4More. First read section 3 ("Rules for every turn") of docs/team/P1-instructions.md, then docs/specs/Down4More-Project-Tree.md and sections 1, 4 and 5 of docs/specs/Down4More-Shared-Components-Spec.md.

TASK: scaffold the project and write the global styles. Do exactly this:

1. If there is no Angular project in the repo root yet, create one with the Angular CLI (latest stable, at least v19): standalone components, SCSS, no SSR, strict mode, routing enabled. If one already exists, keep it. Install @angular/cdk. Delete the default demo content of app.component (leave a bare <router-outlet />, another teammate rewrites app.component later).
2. tsconfig.json paths: "@core/*" -> "src/app/core/*", "@shared/*" -> "src/app/shared/*", "@features/*" -> "src/app/features/*".
3. angular.json: add "stylePreprocessorOptions": { "includePaths": ["src"] } to the build AND test options, so any component SCSS can write @use 'styles/breakpoints' as *;
4. Run `ng generate environments`. In src/environments/environment.ts (the production one) export `production: true`; in environment.development.ts export `production: false`. Both export `const environment = { production: ... }`.
5. src/index.html: load Manrope weights 500, 600, 700, 800 once from Google Fonts (with preconnect). Set <html lang="en">.
6. src/styles/_breakpoints.scss exactly as Shared spec section 4.4:
   $bp-compact: 720px;
   @mixin compact { @media (max-width: $bp-compact) { @content; } }
7. src/styles.scss:
   - the colour tokens, component tokens (--field-border, --field-bg, --pill-border, --pill-bg, --pill-text, --box-border, --box-bg, --box-fg), size/radius/type tokens, and the logo tokens (--logo-primary etc.) with the EXACT light and dark values from Shared spec sections 4.2, 4.3 and 4.4, including the seven history tokens, and the seven Trim tokens (--trim-rail, --trim-track, --trim-add-bg, --trim-add-border, --trim-add-fg, --trim-preview-border, --trim-preview-fg; copy the SCSS token block of Single Style Notes section 7 exactly, light and dark). The dark switch knob when on is left 21px (Shared spec 4.6.5). Light on ":root, :root[data-theme='light']", dark on ":root[data-theme='dark']". Also add the dark values inside "@media (prefers-color-scheme: dark) { :root:not([data-theme]) { ... } }".
   - body: margin 0, font-family var(--font-body), background var(--color-bg), color var(--color-text). box-sizing border-box globally.
   - ALL global button classes from section 4.5 with exact sizes: .btn, .btn--sm, .btn--lg, .btn--primary (on --lg the text colour is --color-on-big-action), .btn--apply, .btn--secondary, .btn--ghost (with the aria-pressed="true" look), .btn--danger (on --icon: --color-accent), .btn--icon (38x38, and .btn--icon.btn--sm = 34x34), .btn--circle (44x44, 2px --color-primary border), .btn--block, .btn--on-color (History rows, with hover).
   - .btn--loading: shows a small CSS spinner, pointer-events none. Disabled buttons: opacity .5, no pointer events.
   - .pill (mode pill and status pill, section 4.5 rows 7 and 8, with aria-pressed="true" look).
   - focus ring rule from section 4.7 and the hover/active brightness rules for big buttons.
   - .visually-hidden exactly as section 4.8.

Do NOT create components. Do NOT touch app.routes.ts yet.

Done when: `ng build` passes; switching data-theme on <html> between light and dark changes the colours; a quick test page with every button class looks right.
Finish with the final report from section 6.
```

---

## T2: Models and `ApiService`

**Wait for:** T1. **Branch:** `p1/t2-models`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Home-Page-Spec.md`, `Down4More-Single-Page-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P1-instructions.md, then these spec parts: Shared spec section 3 (data contracts) and 2.1 (ApiService); Home spec section 8 (FetchResult); Single spec sections 4, 5.3 and 6 (FrameSizeSettings, TrimSegment, SingleExtras); Decisions spec section 1.1 (bitrates); Downloads spec section 9 (DownloadAction); Per-Video Options spec section 1 (MediaItem.catalog).

TASK: write the data contracts. Create these files under src/app/core/models/ and a barrel src/app/core/models/index.ts that re-exports everything:
- media-item.model.ts: MediaItem, with the OPTIONAL field `catalog?: DownloadOptionsCatalog` (a missing catalog means FetchResult.catalog is used; Per-Video spec section 1)
- download-settings.model.ts: MediaMode, CaptionSettings, DownloadSettings, DownloadOptionsCatalog. IMPORTANT: DownloadOptionsCatalog has `bitrates: number[]` (the exact kbps values available, ascending) INSTEAD of `bitrate: {min,max,step}`. Add a comment to that effect.
- download-item.model.ts: DownloadStatus, DownloadItem, DownloadAction ('pause' | 'resume' | 'cancel' | 'retry' | 'remove' | 'prioritize' | 'dismiss'), DownloadActionEvent. Add a comment on speedBps: it is BYTES per second.
- history-entry.model.ts: HistoryEntry
- download-request.model.ts: DownloadRequest, SingleExtras (fileName, trim?, frameSize?), TrimSegment, FrameSizeSettings (use the provisional shape from Single spec section 4)
- fetch-result.model.ts: FetchResult (kind, items, catalog, failed, title?) and FetchFailure
Also create src/app/core/services/api.service.ts: the abstract class ApiService with the 5 abstract methods exactly as in Shared spec 2.1 (fetchInfo, startDownloads, downloads$, control, history). history(query?) returns Observable<DownloadItem[]>. Add the contract note of Per-Video spec section 1 as a comment on startDownloads: each request's settings are what the user ASKED for; the backend resolves them per video (quality: nearest lower, else lowest above; bit-rate: nearest; format: first valid) and returns the resolved settings in DownloadItem.settings.

Use the types exactly as written in the specs. No logic, no Angular decorators except `@Injectable()` is NOT needed on the abstract class. No `any`.

Done when: `ng build` passes; every type named in the specs exists and imports as `import { ... } from '@core/models'`.
Finish with the final report from section 6.
```

---

## T3: Routes, config and stubs (this is **M1**)

**Wait for:** T2. **Branch:** `p1/t3-routes` (or commit to `main`). **When done, merge and tell the whole team: "M1 is on main".**
**Attach:** `Down4More-App-Routing-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Dev-Playground-Spec.md`, `Down4More-Project-Tree.md`, this file.

**Prompt:**

```text
Read section 3 and section 5 ("File ownership", especially "Stub handover") of docs/team/P1-instructions.md. Then read docs/specs/Down4More-App-Routing-Spec.md fully, Playlist Flow spec sections 2 and 3, and Dev Playground spec sections 1 and 2.

TASK: wire the whole app so it compiles and every route resolves, using STUB files that teammates will overwrite later.

A) Real files (you own these):
- src/app/app.routes.ts: export APP_ROUTES exactly as Routing spec section 2, BUT the /dev entry uses loadChildren -> './dev/dev.routes' -> DEV_ROUTES (Dev spec section 1), excluded when environment.production is true. Import hasFetchResultGuard from './features/playlist/guards/has-fetch-result.guard' and isSingleKindGuard from './features/single/guards/is-single-kind.guard'.
- src/app/app.config.ts: provideRouter(APP_ROUTES) and { provide: ApiService, useClass: MockApiService }.
- src/app/dev/dev.routes.ts exactly as Dev spec section 1.
- src/app/dev/dev-shell.component.ts/.html/.scss: sidebar + <router-outlet /> as in Dev spec section 3, but WITHOUT the theme toggle yet (ThemeService does not exist yet). Group labels from GROUP_ORDER = ['Primitives','Shared','Feature','Core'].
- src/app/dev/demos/demo-registry.ts: the FULL DemoEntry list of all 25 entries from Dev spec section 2 (ids, labels, groups, lazy imports).

B) Stub files (teammates overwrite these completely). Each stub is a standalone OnPush component with selector and class name as given and a template that is just `<p>NAME (stub)</p>`:
- features/home/home.component.ts (HomeComponent, d4m-home)
- features/single/single.component.ts (SingleComponent)
- features/downloads/downloads.component.ts (DownloadsComponent)
- features/history/history.component.ts (HistoryComponent)
- features/settings/settings.component.ts (SettingsComponent)
- features/playlist/select/playlist-select.component.ts (PlaylistSelectComponent)
- features/playlist/options/playlist-options.component.ts (PlaylistOptionsComponent)
- features/playlist/playlist.routes.ts: the FINAL PLAYLIST_ROUTES from Flow spec section 2 (it only references the guards and the two components).
- the three guard files as STUBS that simply return true: features/playlist/guards/has-fetch-result.guard.ts (hasFetchResultGuard), features/playlist/guards/has-chosen.guard.ts (hasChosenGuard), features/single/guards/is-single-kind.guard.ts (isSingleKindGuard). Type them as CanActivateFn.
- core/services/mock-api.service.ts: a STUB `@Injectable({providedIn:'root'}) class MockApiService extends ApiService` whose methods return `EMPTY` (history returns of([])).
- ONE stub demo component for each of the 25 entries in demo-registry.ts, file names exactly as in Dev spec section 1 (for example dev/demos/checkbox.demo.component.ts, class CheckboxDemoComponent), each with the template `<h2>NAME</h2><p>Demo coming soon.</p>`.

Add a one-line comment at the top of every stub: `// STUB owned by <owner>: overwrite completely.` (owners are in section 5 of docs/team/P1-instructions.md).

Done when: `ng build` passes; `ng serve` resolves /, /single, /playlist (redirects to /playlist/select), /playlist/options, /downloads, /history, /settings, /dev (redirects to the first demo); an unknown URL like /nope redirects to /.
Finish with the final report from section 6.
```

---

## T4: `d4m-icon` (**M1b**, merge this alone and immediately)

**Wait for:** M1 (your own T3). **Branch:** `p1/t4-icon`.
**Attach:** `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and section 4 ("Primitive API contract") of docs/team/P1-instructions.md, then Shared spec sections 4.5, 4.6 and 5.

TASK: build the d4m-icon primitive in src/app/shared/ui/icon/ (icon.component.ts/.html/.scss/.spec.ts, index.ts).
- Selector d4m-icon. Inputs: name (IconName, required), size = input(20), stroke = input(2).
- Export the IconName union type from index.ts with exactly: plus, x, pause, play, check, retry, arrow-down, arrow-up, chevron-left, chevron-right, trash, warning, moon, sun, search.
- Render an inline SVG (24x24 viewBox) coloured with currentColor, width and height = size. Use a lookup of SVG path data per name (a Record<IconName, ...> in the .ts). Strokes use `stroke`, round caps and joins. Special cases from the specs: `pause` is two FILLED bars; `play` is a FILLED triangle; `x` and `check` are strokes (callers pass stroke 2.6 or 3.2 when needed); `moon`, `sun`, `search`, `retry`, `arrow-down`, `arrow-up`, `plus`, `chevron-left`, `chevron-right`, `trash`, `warning` are clean stroke icons.
- The SVG is aria-hidden="true" (callers add aria-label on the button).
- The host is display: inline-flex.
- Unit tests: renders each IconName without error; size and stroke inputs change the DOM.

Done when: all 15 icons render crisp at 14, 18 and 26 px in both themes. `ng build` passes.
Finish with the final report from section 6.
```

---

## T5: `checkbox`, `panel`, `tag`, `thumb-box`

**Wait for:** M1b. **Branch:** `p1/t5-primitives`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-History-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and section 4 ("Primitive API contract") of docs/team/P1-instructions.md, then Shared spec sections 4.2 to 4.7 and 5. Use d4m-icon from '@shared/ui/icon'.

TASK: build four primitives, each in its own folder under src/app/shared/ui/ with .ts/.html/.scss/.spec.ts and index.ts. Follow the API contract table in section 4 EXACTLY (names, types, defaults).

1. checkbox (d4m-checkbox), look in Shared 4.6.6: 22x22, radius 7, 2px --color-text-muted border; checked = fill and border --color-primary with a check icon (size 14, stroke 3.2) in --color-bg; indeterminate shows a dash instead of the check. Interactive mode: <button type="button" role="checkbox" [attr.aria-checked]="indeterminate ? 'mixed' : value" [attr.aria-label]="label"> that toggles `value`. When `presentational` is true render a <span aria-hidden="true"> with the same look and NO interaction. Disabled: opacity .38.
2. panel (d4m-panel), look in Shared 4.6.2: radius var(--radius-panel), padding 14px 16px (padding='roomy' = 20px 24px), flex column, gap 8, min-width 0, fill var(--color-bg). If `label` is set render it above the content as .lab (13/700, --color-text-muted, centred). Project the content with <ng-content />.
3. tag (d4m-tag), look in 4.6.7: inline-block, margin-top 5, padding 3px 10px, pill, 12/700. variant 'default': fill --color-border, text --color-text. variant 'applied': fill --color-accent, text --color-action-fg.
4. thumb-box (d4m-thumb-box), look in 4.6.9 and the History spec: radius 12, fill --color-surface, border var(--box-border), icon colour --box-fg, play icon centred. size 'row' = 84x56 (icon 26), 'single' = 150x100 (icon 34), 'preview' = flex 1 with min-height 120 (icon 40). `bordered` false removes the border. With `src` set show the image (object-fit: cover) with `alt`; if `src` is null (or the image fails to load) show the placeholder.

Unit tests for each (inputs to DOM, checkbox output when clicked, presentational has no button).
Done when: every state renders correctly in light and dark; `ng build` passes.
Finish with the final report from section 6.
```

---

## T6: `page-container`

**Wait for:** M1. **Branch:** `p1/t6-page-container`.
**Attach:** `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P1-instructions.md, then Shared spec sections 4.1, 4.4, 4.6.1 and 6.1.

TASK: build d4m-page-container in src/app/shared/components/page-container/ (.ts/.html/.scss/.spec.ts, index.ts).
- Inputs: size 'sm' | 'md' | 'lg' (default 'md'; max-width 640 / 920 / 1040, centred), padding 'default' | 'split' | 'compact' | 'none' (default 'default' = 40px 48px 36px; 'split' = 32px 40px 36px; 'compact' = 24px 16px; 'none' = 0), layout 'stack' | 'split' (default 'stack').
- Look: fill --color-surface, radius --radius-card, 1px --color-border, shadow --shadow-card, box-sizing border-box, width 100%.
- Slots with ng-content select: [header], default, [footer], [main], [side]. The header and footer wrappers must leave NO gap when nothing is projected (use :empty on the wrapper).
- layout 'split': a flex row with flex-wrap: wrap and gap 28px 36px. [main] = flex 1.12 1 380px, [side] = flex 1 1 340px, min-width 0. They stack ([main] on top) automatically when they cannot sit side by side (about 900px viewport). In `layout='split'` the default slot is not used.
- In the compact layout (@include compact, see rule in section 3): padding becomes 24px 16px for every padding value except 'none', split gap becomes 24px, and the columns are always one column.
- Unit tests for the three sizes, empty header/footer, and projection of [main] and [side].

Done when: all three sizes work; empty header/footer leave no gap; split sits side by side at 1000px and stacks at 800px and 390px. `ng build` passes.
Finish with the final report from section 6.
```

---

## T7: `item-container` (the hardest shared component)

**Wait for:** M2 (needs `checkbox` merged; media-thumbnail is not required to build it). **Branch:** `p1/t7-item-container`.
**Attach:** `Down4More-Shared-Components-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-Playlist-Options-Page-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P1-instructions.md, then Shared spec sections 4.6.10, 4.6.11 and 6.7 completely. Skim Downloads spec section 5 and Options spec sections 2 and 4.1 to see how it is used.

TASK: build d4m-item-container in src/app/shared/components/item-container/ with: item-container.component.ts/.html/.scss/.spec.ts, item-template.directive.ts (selector ng-template[d4mItem], class ItemTemplateDirective, typed context), index.ts.

Inputs/outputs EXACTLY as the table in 6.7: items (required), itemId (default item => item.id), selectable (false), selectedIds = model<string[]>([]), virtualScroll (true), visibleRows (5), rowHeight (82), rowGap (10), heightMode 'fixed' | 'fit' ('fixed'), selectAllLabel ('Select all'), noSelectionMeansAll (false), summary (string | null), outputs itemActivated and scrolledToEnd. Slots: ng-template[d4mItem], [toolbar], [empty]. Row template context: $implicit, selected, toggle(), index.

Implementation requirements:
- Use Angular CDK <cdk-virtual-scroll-viewport> with itemSize = rowHeight + rowGap, each row inside a wrapper of exactly that size. With virtualScroll=false render a plain list.
- Height = visibleRows * rowHeight + (visibleRows - 1) * rowGap + 4 (454px for 5 rows). heightMode 'fixed' keeps that height even with fewer items.
- Header (only when selectable=true; with selectable=false render NO header at all): flex, flex-wrap wrap, align-items center, gap 8px 10px. Contents: a ghost button (.btn.btn--sm.btn--ghost, aria-pressed) labelled selectAllLabel, then the [toolbar] slot, then the summary text on the right (14/600 --color-text-muted, aria-live="polite", default "N of M selected", or the `summary` input if provided). In the compact layout the summary may drop under the buttons, right-aligned.
- Select-all: pressed when all current items are selected; clicking selects or clears ALL CURRENT items (a filtered list selects only what is visible). Selecting keeps list order.
- toggle(): appends the id to the END of selectedIds when selecting (order matters), removes it when unselecting.
- When `items` changes, drop ids from selectedIds that no longer exist.
- noSelectionMeansAll: the header button is pressed when selectedIds is empty, and clicking it clears the selection (summary text is whatever the page passes).
- Custom scroll rail on the left exactly as 4.6.11 (native scrollbar hidden, track, thumb with min height 34, drag with pointer events and cursor grab, track click jumps, thumb hidden when everything fits). Top 14px and bottom 22px fade mask.
- Rows are 82px tall (var(--row-height)), gap var(--row-gap).
- [empty] slot is shown when items is empty.

Unit tests: visibleRows 3, 5, 8 give the right height; select-all with a filtered list; toggle appends in order; items change prunes ids; selectable=false has no header; noSelectionMeansAll pressed state; 1000 items render without freezing (smoke test).
Done when: the "Done when" of 6.7 passes (you can use a temporary test host component; the real /dev demo comes in T9). `ng build` passes.
Finish with the final report from section 6.
```

---

## T8: Downloads page and `status-count`

**Wait for:** M3 (`item-container`, `download-info`, `nav-buttons`, `ProgressService`, `DownloadService`). **Branch:** `p1/t8-downloads`.
**Attach:** `Down4More-Downloads-Page-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P1-instructions.md, then docs/specs/Down4More-Downloads-Page-Spec.md COMPLETELY (this is your page spec), plus Shared spec 6.3 (nav-buttons), 6.6 (download-info), 6.7 (item-container).

TASK: build the Downloads page. OVERWRITE the stub src/app/features/downloads/downloads.component.ts and create:
- features/downloads/downloads.component.ts/.html/.scss: use the code in spec section 4.1 as the starting point (filter, selectedIds, counts, visible, details, toolbar with Pause all and Priority, onToolbar, onAction, run). Use ProgressService (core/services/progress.service.ts, field `items`) and DownloadService.control() from '@core/services/...'. Use d4m-page-container size="lg" padding="split" layout="split", d4m-item-container (selectable, visibleRows 5), d4m-nav-buttons in the [toolbar] slot, d4m-download-info variant small in rows and variant big in the details panel (inside d4m-panel), d4m-status-count in a d4m-panel.
- features/downloads/components/status-count/status-count.component.ts/.html/.scss/.spec.ts + index.ts: spec section 4.2 (inputs counts and two-way value, three .pill buttons with dots, 999+, aria-pressed). Compact rules from spec 2.1.
- the compact layout rules (spec 2.1) and ALL states in spec section 6 (empty, empty filter, request failed, etc.).
Do not edit download-info, item-container or any service. If something is missing in them, list it under Questions.

Done when: the "Done when" list in spec section 10 passes against MockApiService (7+ rows, pills filter, Pause all, Priority, row actions, live updates). `ng build` passes.
Finish with the final report from section 6.
```

---

## T9: `/dev` shell finish and your demos (M5)

**Wait for:** M3 (`ThemeService` on `main`). **Branch:** `p1/t9-dev`.
**Attach:** `Down4More-Dev-Playground-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P1-instructions.md and docs/specs/Down4More-Dev-Playground-Spec.md fully.

TASK:
1. Finish src/app/dev/dev-shell.component.* with the pinned theme toggle exactly as Dev spec section 3 (ThemeService from '@core/services/theme.service', d4m-icon). Add the .demo__case and .demo__caption styles used by all demos in a GLOBAL way: put them in dev-shell.component.scss using ::ng-deep or in styles.scss under a "/dev" comment, so every demo uses the same look.
2. OVERWRITE the stub demo components you own: icon, checkbox, panel, tag, thumb-box, page-container, item-container, status-count (files in src/app/dev/demos/). Follow Dev spec section 4: use the REAL component, one captioned case per state/variant listed in that component's own spec, real mock data (MOCK_MEDIA_ITEMS etc. from '@core/mocks/mock-data') where it exists. checkbox: the exact example in Dev spec section 4. item-container: the three usages from Shared 6.7 plus 5 visible rows with 9 items, 5 visible rows with 300 items, and the [empty] state, with a small dev-only toggle button to switch between them. icon: all 15 icons at 14/18/26.

Done when: Dev spec section 5 passes for your demos; the 300-item list scrolls smoothly; `ng build` passes.
Finish with the final report from section 6.
```

---

## T10: Final review (M5)

**Wait for:** all PRs merged. **Branch:** `p1/t10-review` (only if fixes are needed).
**Attach:** `Down4More-App-Routing-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Project-Tree.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P1-instructions.md and docs/specs/Down4More-App-Routing-Spec.md section 8, Decisions spec section 3, Per-Video spec section 5, and the "Done when" of every page spec.

TASK: audit the merged app. DO NOT rewrite features. For each check, report PASS/FAIL, and for each FAIL fix it with the smallest possible change (or list it under Questions if it belongs to another owner):
1. `ng build --configuration production` succeeds, and the production output does NOT contain the /dev route tree: search dist/ for "DevShellComponent" and "demo-registry"; both must be absent.
2. `grep -R "MockApiService" src/app` appears only in app.config.ts and core/services/mock-api.service.ts (and its spec).
3. grep for the literals `720px`, `#` hex colours, `rgb(` and `localStorage` inside src/app/**/*.scss and *.ts: raw `720px` must appear only in styles/_breakpoints.scss and the two documented exceptions; hex colours only in styles.scss; localStorage only in theme.service.ts. (Also grep for ": any".)
4. Bit-rate: grep for "min:", "step:" and "300" related to bitrate; there must be none left. `defaultDownloadSettings` gives bitrate 192.
5. Happy paths with the mock: / -> paste one video link -> Fetch -> /single -> Download -> /downloads. And / -> paste a playlist link (for example https://youtube.com/playlist?list=PL1) -> /playlist/select -> Next -> /playlist/options -> Apply -> Download -> /downloads. Also a link containing "fail", and a link containing "big" (300 items).
6. Reloading /single, /playlist/select, /playlist/options redirects as in Routing spec section 6, with no console errors.
7. Compact layout at 390px, light and dark, on every page: no horizontal scroll.
8. All unit tests pass.
9. Per-video options (Per-Video spec section 5): with the mock, tick p-4 alone and check the panel offers no 2160p/1440p; tick p-4 and p-5 and check the panel offers the full list; pick 2160p, Apply, Download, and check Downloads shows p-5 at 2160p and p-4 at 1080p. Grep that no file under features/ or shared/ resolves a quality per video (only MockApiService.startDownloads does).
Print a table of PASS/FAIL results as the final report.
```
