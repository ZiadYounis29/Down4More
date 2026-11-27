# Down4More — P4 instructions

> **Your job:** Mock backend, core services, Home page.
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

# 7. P4 turns

Your order: **T1 → T2 → T3 → T4 → T5 → T6**. You own the fake backend (`MockApiService` + mock data), every core service, and the Home page. Your work is on the critical path for P5 and P1: push T1 first.

---

## T1: Core services

**Wait for:** M1. **Branch:** `p4/t1-services`.
**Attach:** `Down4More-Home-Page-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-History-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-Core-Shell-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P4-instructions.md, then Home spec sections 6 and 8, Downloads spec 3.1 and 3.2, History spec 3.1, Flow spec section 2 (DownloadService), Shared spec 2.1.

TASK: write the five core services in src/app/core/services/ (each `@Injectable({ providedIn: 'root' })`, each with a small .spec.ts using a fake ApiService). They only depend on ApiService (abstract class from './api.service') and on '@core/models'. Do NOT touch api.service.ts, theme.service.ts or mock-api.service.ts in this turn.
1. url-parser.service.ts: UrlParserService with parse(raw: string) that calls parseUrl from '@core/utils/parse-url' (P3 writes it; if it is not on main yet, leave the import and report it).
2. fetch-info.service.ts: FetchInfoService exactly as Home spec section 8: `lastResult = signal<FetchResult | null>(null)` and `load(urls: string[]): Observable<FetchResult>` using tap to set lastResult.
3. download.service.ts: DownloadService with `start(requests: DownloadRequest[]): Observable<void>` (calls api.startDownloads) and `control(action: DownloadAction, ids: string[]): Observable<void>` (calls api.control).
4. progress.service.ts: ProgressService exactly as Downloads spec 3.1: `items: Signal<DownloadItem[]>` = toSignal(api.downloads$().pipe(auditTime(250)), { initialValue: [] }).
5. history.service.ts: HistoryService exactly as History spec 3.1 (items, status, load(), drop(id)).
Tests: fetch-info sets lastResult on success; history load sets status loading -> ready and error; drop removes the entry; download.control forwards the call.

Done when: tests pass; `ng build` passes. Tell the team "services are on main" after merge.
Finish with the final report from section 6.
```

---

## T2: Mock data

**Wait for:** M1. **Branch:** `p4/t2-mock-data`.
**Attach:** `Down4More-Mock-Api-Service-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-History-Page-Spec.md`, `Down4More-Download-Options-Decisions-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P4-instructions.md, then Mock API spec sections 4 and 5, Flow spec section 6 (the 9 playlist items), Downloads spec section 8 (mock downloads), History spec section 8 (mock history), Decisions spec 1.4 (MOCK_CATALOG) and Per-Video spec section 3 (three items with their own catalog).

TASK: write src/app/core/mocks/mock-data.ts. It exports typed constants (types from '@core/models'). Everything is DETERMINISTIC: no Math.random, no randomness at all. Use thumbnailUrl: null for every item (there is no network for images).

1. MOCK_CATALOG (Decisions 1.4): qualities ['2160p','1440p','1080p','720p','480p','360p'], videoFormats ['mp4','mkv','webm'], audioFormats ['mp3','m4a','opus','wav'], bitrates [96,128,160,192,256,320].
2. MOCK_PLAYLIST_ITEMS: the 9 items of Flow spec 6 in that EXACT order with the exact sizeBytes and durationSec values from the table (ids 'p-1'..'p-9', url 'https://youtube.com/watch?v=<id>', channelName 'Down4More Demo'). Then apply the fixed edge cases: item 5 "Desert timelapse in 4K" keeps thumbnailUrl null (as all), item 7 "Morning run routine" gets a VERY LONG title (about 140 characters, keep it starting with "Morning run routine"), item 8 "Keyboard sound test" gets sizeBytes null, item 9 "Documentary: the Nile delta" gets durationSec null. ADDITIONALLY (Per-Video spec section 3) three items carry their own `catalog` and no other item does: p-4 "Lo-fi study mix, 2 hours" = MOCK_CATALOG with qualities [1080p,720p,480p,360p] and bitrates [96,128,160,192]; p-8 "Keyboard sound test" = MOCK_CATALOG with qualities [1080p,720p,480p,360p]; p-9 "Documentary: the Nile delta" = MOCK_CATALOG with videoFormats [mp4,mkv] and bitrates [128,192,256]. Generated and MOCK_MEDIA_ITEMS items have none.
3. MOCK_MEDIA_ITEMS: at least 12 items for single/unknown links: the 9 playlist items plus 3 more (for example "Sourdough bread in 60 minutes", a live stream with durationSec null and sizeBytes null, and one more very-long-title item). ids 'm-1'..'m-12'.
4. MOCK_DOWNLOADS (the ACTIVE part of the queue; Downloads spec section 8): the 7 table rows in order with priorities 1..7 and status/percent/speed/done/total/ETA from the table (convert MB to bytes with 1024*1024; speedBps is BYTES per second), default settings for every item = { mode 'video+audio', quality '1080p', format 'mp4', bitrate 192, captions {enabled:false, separateFile:false} }; row 5 is 'processing' (speedBps null, etaSec null, progress 100). Plus: one 'queued' item, one 'paused' item (speedBps and etaSec null), one item with a very long title, one with unknown total size (totalBytes null, etaSec null). All ids start with 'dl-'.
5. MOCK_HISTORY: the 8 named rows of History spec 8 plus 62 generated older entries (alternating done and failed, deterministic by index, spread over about 120 days, ONE dated in the previous year, e.g. 31 Dec of last year), one very long title, one with unknown size (totalBytes and sizeBytes null), failed entries with error text alternating "Video unavailable" and "Network error", settings varied by index (mix of 1080p/720p/480p, mp4/mkv/webm, one audio-only mp3 with quality null). Build `finishedAt` relative to `Date.now()` at module load (for example "20 min ago", "yesterday 18:10"), as ISO strings. ids start with 'h-'. Each entry is a full DownloadItem (status 'done' or 'failed', progress 100 for done, totalBytes set from the size column).
6. A helper `seedStore(): { items: DownloadItem[]; dismissedIds: string[] }` that returns MOCK_DOWNLOADS followed by MOCK_HISTORY as ONE list (one shared store, Mock API spec section 3), and `dismissedIds` = the ids of every done/failed history entry EXCEPT the 4 newest done and the 2 newest failed ones. Reason: Downloads must show "4 Done" and "2 Failed" as in the design while History shows all 70 (dismiss hides from Downloads only).
7. A function `generatePlaylistItems(count: number, prefix: string): MediaItem[]` for the 'big' (300 items) case: deterministic titles "Generated video N", durations and sizes from a fixed arithmetic pattern.

Add a small spec file mock-data.spec.ts: 9 playlist items in order; sizes of Flow spec section 6; only p-4, p-8 and p-9 carry their own catalog; 70 history entries; exactly one entry dated in the previous year; seedStore dismissed ids leave exactly 4 done and 2 failed visible.
Done when: tests pass; `ng build` passes. Do NOT edit mock-api.service.ts in this turn.
Finish with the final report from section 6.
```

---

## T3: `MockApiService`

**Wait for:** T2 (your own) and `parse-url` merged (P3 T1), and `fallback-quality` + `nearest-bitrate` merged (P3 T2). **Branch:** `p4/t3-mock-api`.
**Attach:** `Down4More-Mock-Api-Service-Spec.md`, `Down4More-Downloads-Page-Spec.md`, `Down4More-History-Page-Spec.md`, `Down4More-Home-Page-Spec.md`, `Down4More-Playlist-Flow-Spec.md`, `Down4More-Per-Video-Options-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P4-instructions.md, then docs/specs/Down4More-Mock-Api-Service-Spec.md COMPLETELY (this is your spec), plus Home spec section 9, Downloads spec sections 5 and 8, History spec section 8, and Per-Video spec section 3 (startDownloads resolves settings).

TASK: OVERWRITE the stub src/app/core/services/mock-api.service.ts with the real MockApiService (`@Injectable({ providedIn: 'root' })`, `extends ApiService`). It imports only '@core/models', '@core/mocks/mock-data', '@core/utils/parse-url', '@core/utils/fallback-quality', '@core/utils/nearest-bitrate' and rxjs. It must NOT import anything from features/.

Requirements (all from the spec; the notes below only resolve its gaps):
- ONE shared store: `private store = signal<DownloadItem[]>(seedStore().items)` and `private dismissed = signal<Set<string>>(new Set(seedStore().dismissedIds))` (see mock-data.ts). `nextPriority = 1000`.
- fetchInfo(urls): resolves after ~600 ms. Per URL: use parseUrl; the text contains "fail" -> push to `failed` (FetchFailure with a human reason); kind 'video' or 'unknown' -> ONE item from MOCK_MEDIA_ITEMS (cycle through the list with a counter); kind 'playlist' with "big" in the URL -> generatePlaylistItems(300, ...); other playlists -> MOCK_PLAYLIST_ITEMS (the 9, same order). Ids must be unique inside one result: the first occurrence keeps its id, later duplicates get a suffix `-2`, `-3`... kind is 'single' only when there is exactly one URL and it produced exactly one item; otherwise 'playlist'. catalog is always MOCK_CATALOG. If every URL failed, items is [] and the Observable still completes normally (no thrown error). `title` is set for a single playlist link.
- startDownloads(requests): each request becomes a DownloadItem (status 'queued', progress 0, downloadedBytes 0, totalBytes = item.sizeBytes ?? null, priority nextPriority++, settings = the request's settings RESOLVED against request.item.catalog ?? MOCK_CATALOG (quality via fallbackQuality, bit-rate via nearestBitrate, format reset to the first valid one for the mode if it is not available; this stands in for backend work, Per-Video spec section 3), title from item, a deterministic speedBps picked from [4.1, 6.3, 9.8, 17.2, 21.5] MB/s by a counter) appended to the store. If extras.fileName exists you may ignore it. Resolves immediately.
- downloads$(): `interval(1000).pipe(startWith(0), ...)` with share({ refCount: true }) so the loop runs only while subscribed. Each tick (advanceOneTick): (1) concurrency: at most 3 items 'downloading' at once. This cap only controls STARTING items: if fewer than 3 are downloading, start the lowest-priority-number queued items until 3 or the queue is empty (the seed has more than 3 downloading at boot and that is fine); (2) each 'downloading' item advances downloadedBytes by speedBps, then progress = min(100, round(downloaded/total*100)) and etaSec = remaining/speed. If totalBytes is null: progress += 2 per tick and etaSec stays null; (3) at progress 100 the item becomes 'processing' (speedBps and etaSec null) for 3 ticks (keep a private Map<string, number> of ticks left), then 'done' with finishedAt = now ISO; (4) an item whose title contains the word "fail" becomes 'failed' with error "Network error" when it reaches 50% (so the error states can be tried); (5) the emitted list is the store filtered by `dismissed`. Emit a NEW array each tick (immutable updates).
- control(action, ids): exactly the table in spec section 3.4: pause (paused, speedBps and etaSec null), resume (paused -> queued), cancel (delete from store), retry (failed -> queued, clear error, clear finishedAt, progress 0, downloadedBytes 0), remove (delete from store), prioritize (give the ids the lowest priority numbers, keeping their relative order, so they sort first), dismiss (add to `dismissed`; the store is untouched). Returns of(undefined). Unknown ids are ignored.
- history(query?): items with status done or failed, NOT filtered by dismissed, newest finishedAt first, title filter case-insensitive, `of(rows)` (completes after one emission).
- A done item from downloads$ is the SAME record history() returns later.
Write mock-api.service.spec.ts (use fakeAsync / jasmine clock): fetchInfo cases (single video, single playlist = 9 in order, 2+ links = playlist, "fail" link, "big" link = 300, all failed = items []); startDownloads resolving a quality the item lacks to the nearest lower one (p-4 asked for 2160p becomes 1080p); concurrency cap; processing then done after 3 ticks; control actions incl. dismiss keeps History and cancel removes everywhere; retry moves a failed item back to queued; history sorted and filtered.
Done when: the "Done when" of the Mock API spec (section 6) passes; `ng build` passes.
Finish with the final report from section 6.
```

---

## T4: `url-bar` and `url-list`

**Wait for:** M3 for `nav-buttons` (P5 T2). **Branch:** `p4/t4-home-parts`.
**Attach:** `Down4More-Home-Page-Spec.md`, `Down4More-Shared-Components-Spec.md`, this file.

**Prompt:**

```text
Read section 3 and 4 of docs/team/P4-instructions.md, then Home spec sections 2, 2.3, 3.2, 3.3 and 10 and Shared spec 4.5 (rows 3, 4, 5, 6) and 6.3 (nav-buttons, navFetch preset from '@shared/components/nav-buttons').

TASK: build two dumb Home-only components under src/app/features/home/components/ (each with .ts/.html/.scss/.spec.ts and index.ts; same rules as shared components: OnPush, tokens only, no services, no router).
1. url-bar/ (d4m-url-bar): inputs value = model(''), error: string | null, loading = false, canFetch = false; outputs add and fetch. Layout/look from spec 2.3 ("Bar", "Plus button", "Input", "Fetch button", "Inline error"): the bar is flex, gap 12, bottom border 2px --color-primary (--color-accent while the input has focus, use :focus-within). Plus button .btn.btn--circle with a plus icon 20 and aria-label "Add link", disabled when value is empty or loading. Input: 20px, aria-label "Link", inputmode="url", autocomplete="off", spellcheck="false", placeholder "Paste a link to fetch"; Enter emits `add`. Fetch is d4m-nav-buttons size="md" holding [{ ...navFetch(), disabled: !canFetch(), loading: loading() }]; its (pressed) emits `fetch`. The error text sits under the bar (13/700 --color-danger, role="alert"). While loading the input and plus are disabled.
2. url-list/ (d4m-url-list): inputs entries: UrlEntry[] (required; UrlEntry is declared in home.component.ts per spec 3.1, but to avoid a circular import export the interface and MAX_LINKS from a new file features/home/url-entry.model.ts and have home.component import it), disabled = false; outputs remove (string id) and clear. A real <ul> of rows: number (14/800 --color-accent), type chip (12/700, --color-border fill; text "Video" | "Playlist" | "Link"; when entry.failed the chip is replaced by a red tag "Couldn't load" using d4m-tag variant 'applied'), URL (14, muted, ellipsis, title attribute = full URL), remove button (.btn.btn--danger icon-only 44x44, x icon, aria-label "Remove link N"). Rows: height 52, dashed bottom border. Layout: 1 to 3 links = one column; 4 or more = two columns with a 1px vertical divider, rows per column = max(3, ceil(n/2)), rows fill the left column top to bottom first. The two-column state is the CSS class `.two-col` (so the compact layout can override with `grid-template-columns: 1fr` and hide the divider; in the compact layout it is ALWAYS one column). Footer (only when there is at least 1 link): "N link" / "N links" on the left and a ghost button "Clear all" (.btn.btn--sm.btn--ghost) on the right. disabled disables remove and Clear all.
Unit tests: url-bar emits add on Enter and plus, disabled states, error text; url-list column logic for 1, 3, 4, 7 entries, failed chip, remove and clear emit.

Done when: both components match the spec in light and dark and in the compact layout; `ng build` passes.
Finish with the final report from section 6.
```

---

## T5: Home page

**Wait for:** M3 (T4 + `nav-buttons` + `logo` + `page-container`). **Branch:** `p4/t5-home-page`.
**Attach:** `Down4More-Home-Page-Spec.md`, `Down4More-Shared-Components-Spec.md`, `Down4More-App-Routing-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P4-instructions.md, then docs/specs/Down4More-Home-Page-Spec.md COMPLETELY (this is your page spec).

TASK: OVERWRITE the stub src/app/features/home/home.component.ts and create home.component.html and home.component.scss.
- State (spec 3.1): links (signal UrlEntry[]), draft, draftError, fetching, fetchError, canFetch. Import UrlEntry and MAX_LINKS from features/home/url-entry.model.ts (created in T4). Use UrlParserService and FetchInfoService from '@core/services/...' and Router.
- Template (spec 3.1): h1.home__title with <d4m-logo variant="wordmark" /> (60/800, letter-spacing -.02em, margin 48px 0 8px; compact: clamp(36px, 9vw, 60px)), subtitle (17/500 muted, margin 0 0 32px, text "Paste your links and download them all in one go."), then <d4m-page-container size="md"> with <d4m-url-bar>, the fetchError paragraph (role="alert"), and <d4m-url-list> only when there are links. Card gets aria-busy while fetching.
- Behaviour (spec 4 and 5): adding (split the draft on whitespace, commas and new lines; each piece through parseUrl; errors "That doesn't look like a link.", "Already in the list.", "You can add up to 50 links."; keep only the skipped text in the bar; append new entries at the END; clear the bar when everything was added), removing and Clear all (focus returns to the bar), Fetch (add the typed text first, stop if that fails; call FetchInfoService.load(urls); on success navigate: result.kind === 'single' ? ['/single'] : ['/playlist','select']; if items is empty mark every row failed and show "None of the links could be loaded. Check them and try again."; if SOME failed navigate with the ones that worked; if the call errors show "Couldn't reach the downloader. Try again." and leave rows unchanged). Mark rows `failed` by matching result.failed urls to entry urls.
- Accessibility (spec 10): visually hidden aria-live="polite" region announcing "Link added, N links in the list" and "Link removed".
- Compact layout: card padding comes from page-container; list always one column (already handled in url-list).

Done when: Home spec section 12 passes against MockApiService: first visit shows only the bar; plus/Enter adds; duplicates and invalid links rejected with the text kept; pasting several links adds one row each; 1 video link -> /single, 1 playlist link (e.g. https://youtube.com/playlist?list=PL1) -> /playlist/select, 2+ links -> /playlist/select; a link containing "fail" shows the failed states. `ng build` passes.
Finish with the final report from section 6.
```

---

## T6: `/dev` demos and end-to-end check (M5)

**Wait for:** M4. **Branch:** `p4/t6-demos-e2e`.
**Attach:** `Down4More-Dev-Playground-Spec.md`, `Down4More-Home-Page-Spec.md`, `Down4More-Mock-Api-Service-Spec.md`, `Down4More-App-Routing-Spec.md`, this file.

**Prompt:**

```text
Read section 3 of docs/team/P4-instructions.md, Dev Playground spec sections 4 and 5, Home spec section 11, and Routing spec section 8.

TASK 1: OVERWRITE the stub demo components you own in src/app/dev/demos/ (keep file and class names): url-bar.demo and url-list.demo. url-bar: empty, with text, error, loading, fetch disabled. url-list: 1 link, 3 links, 4 links (two columns start), 7 links, 50 links, a very long URL, a failed row, disabled; also 390px wide wrappers.

TASK 2 (verification only, do not rewrite other people's files): run the app and check, then report PASS/FAIL for each: (a) / -> one video link -> /single -> Download -> /downloads shows the new item in the queue; (b) / -> playlist link -> /playlist/select -> Next -> /playlist/options -> Apply -> Download -> /downloads; (c) the Downloads page shows 4 Done, 2 Failed and the rest in progress, and History shows 70 entries; (d) a download that reaches 100% becomes 'processing' for 3 seconds then 'done' and then appears in History; (e) Retry in History moves the item to the Downloads queue; (f) a link containing "big" gives 300 rows that scroll smoothly. List any bug you find under Questions with the file and owner; fix only bugs inside YOUR files.

Done when: your demos work at /dev/url-bar and /dev/url-list; the report is complete. `ng build` passes.
Finish with the final report from section 6.
```
