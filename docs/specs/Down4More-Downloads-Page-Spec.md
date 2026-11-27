# Down4More: Downloads Page Spec

> **Scope:** `src/app/features/downloads/` plus the one core service it needs (`ProgressService`). Companions: `Down4More-Shared-Components-Spec.md` (tokens, `page-container`, `item-container`, `download-info`, `nav-buttons`), `Down4More-Playlist-Flow-Spec.md` (where Download sends the user), `Down4More-Core-Shell-Spec.md`.
> **Design sources:** `Down4More-Downloads.html` (both themes) and the Downloads screens in the Excalidraw SVG. The SVG adds a **Priority ↑** button next to Pause all that the HTML does not have. This spec includes it.
> **Backend:** none yet. Everything goes through `ApiService` (`downloads$()` and `control()`) and its mock.

---

## 0. The page in one minute

Left: the queue. Each row shows a download with its progress bar, speed, size and ETA, plus pause and cancel buttons. Above the list: **Select all**, **Pause all**, **Priority ↑** and "N of M selected". Right: three status buttons that count and filter (**Done**, **Downloading**, **Failed**), and below them a **details card** for the selected download. Everything updates live while downloads run.

---

## 1. Route and files

| | |
|---|---|
| Route | `/downloads`, lazy `loadComponent`. The nav bar link is active here (Core spec) |
| Component | `DownloadsComponent`, selector `d4m-downloads`, standalone, OnPush |

```
features/downloads/
├─ downloads.component.ts / .html / .scss        (smart: reads ProgressService, calls DownloadService)
└─ components/
   └─ status-count/   d4m-status-count           (dumb: the three status buttons)
core/
├─ services/progress.service.ts                  (live list of downloads, section 3)
└─ services/download.service.ts                  (already exists from the Flow spec: start(). Gains control(), section 3)
```

**Shared pieces used:** `d4m-page-container` (`size="lg"`, `padding="split"`, `layout="split"`), `d4m-item-container`, `d4m-download-info` (variants `small` and `big`), `d4m-nav-buttons` (size `sm`, in the list toolbar), `d4m-panel`. `d4m-status-count` is Downloads-only, so it lives under `features/downloads/components/` and follows the same rules as shared components (dumb, OnPush, tokens only).

---

## 2. Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Select all] [Pause all] [Priority ↑]   1 of 7 selected │ ( ● 4 Done  ● 7 Downloading  ● 2 Failed ) │
│ ┃ ☑ [▶] Rocket landing, full…  67%  [⏸][✕]            │ ┌──────────────────────────────────┐ │
│ ┃       ━━━━━━━━━━━━━━░░░░                              │ │          [ preview  ▶ ]          │ │
│ ┃       17.2 MB/s   412 / 615 MB   ETA 40 hrs           │ │ Video          │ Format  mp4     │ │
│ ┃ ☐ [▶] How tides actually…  42%  [⏸][✕]               │ │ Rocket landing │ Quality 1080p   │ │
│ ┃  ...5 rows visible, the rest scrolls...               │ │ Channel        │ Bit-rate 300    │ │
│                                                         │ │ 67%  17.2 MB/s  412/615MB ETA 40h │ │
│                                                         │ │ ━━━━━━━━━━━━░░░░░  [⏸] [✕]        │ │
│                                                         │ └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Card | `<d4m-page-container size="lg" padding="split" layout="split">`: max-width 1040, padding `32px 40px 36px`. `[main]` = the queue (flex `1.12 1 380px`), `[side]` = status + details (flex `1 1 340px`), gap 36. The columns stack, queue first, automatically below a viewport of about 900px (page-container rule). The compact layout (720px and narrower) is in 2.1 |
| Heading | visually hidden `<h1>` "Downloads" |
| Queue | `d4m-item-container`, `selectable`, `visibleRows = 5` (the design's list is 452 px = 5 rows), default summary "N of M selected" |
| List toolbar | `<d4m-nav-buttons toolbar size="sm">` with two ghost buttons after Select all: **Pause all** and **Priority** (arrow-up icon after the label). Look: shared spec 4.5 row 6 |
| Row | `d4m-download-info variant="small" [selectable]="true"`: checkbox, thumb box 84 x 56, title (one line, ellipsis) with the percent on the right (13 / 800 primary), 6 px progress bar, meta line (speed, `x / y MB`, ETA), then pause and cancel icon buttons (34 x 34). Look: 4.6.8, 4.6.10 and 4.5 row 9 |
| Side, panel 1 | `<d4m-panel>` holding `<d4m-status-count>`: three pills, flex, gap 8, centred, **no wrap** (4.5 row 8). Dots: Done `--color-success`, Downloading `--color-apply`, Failed `--color-accent`. Pill text "4 Done" (count, then name) |
| Side, panel 2 | `<d4m-panel>` with `flex: 1` and gap 14, holding `<d4m-download-info variant="big">` for the selected download (preview box, Video / Channel, Format / Quality / Bit-rate table, percent 20 / 800, speed, size, ETA, progress bar with pause and cancel icons). Look: 6.6 and 4.6.9 |

> **Pill width:** at the designed width (about 436 px) the three pills fit on one line. Below about 460 px of side width they may not. Allow them to wrap there (assumed) rather than overflow.

### 2.1 Compact layout (rev 3)

At 720px and narrower (shared spec 4.4): the queue is **on top** and everything that was on the right sits **under it**, in one column, like the compact Single page. Between 720px and about 900px the columns are already stacked, but everything keeps its desktop look. **No design exists for the compact layout, so this is assumed.**

```
┌────────────────────────────┐
│ [Select all] [Pause all]     │
│ [Priority ↑]   1 of 7 selected │   header wraps
│ ┃ ☑ Rocket landing…    67% [⏸][✕] │
│ ┃   ━━━━━━━━━━░░░░             │
│ ┃   17.2 MB/s · ETA 40 hrs     │
│ ┃  ...5 rows visible...        │
│                                │   gap 24
│ ( ● 4 Done  ● 7 Downloading    │
│   ● 2 Failed )                 │   pills wrap
│ ┌──────────────────────────┐ │
│ │        [ preview ▶ ]       │ │
│ │ Video  Rocket landing…     │ │
│ │ Channel  …                 │ │
│ │ Format   mp4               │ │
│ │ Quality  1080p             │ │
│ │ Bit-rate 300               │ │
│ │ 67%  17.2 MB/s  412/615 MB │ │
│ │ ━━━━━━━━━━░░░  [⏸] [✕]     │ │
│ └──────────────────────────┘ │
└────────────────────────────┘
```

| Part | Compact rule |
|---|---|
| Order | 1 queue (header + 5 rows), 2 status panel, 3 details panel. This is the DOM order, so the Tab order does not change |
| Card | padding `24px 16px`, gap between the three blocks 24 |
| List header | wraps (shared 6.7). The three buttons need about 320px, so on a phone the summary "1 of 7 selected" ends up on its own line, right-aligned |
| Row | the compact `download-info small` (shared 4.6.10 and 6.6): **no thumb box**, title with the percent on its right, the bar, then `speed · ETA` (the `x / y MB` part is only in the details card). Pause and cancel stay 34 x 34 |
| Status panel | panel padding 12. Pills `padding: 0 10px`, 14 / 700, gap 6, **wrap allowed and centred** (at 360 to 390px "7 Downloading" does not fit on one line with the other two) |
| Details panel | `flex: none` (no stretching), holds `d4m-download-info variant="big"` in its compact layout: preview, Video / Channel, the Format / Quality / Bit-rate table as rows, percent and speed, progress bar with pause and cancel (shared 6.6) |

```scss
// downloads.component.scss (additions)
@include compact {
  .dl__side { height: auto; }
  .dl__details { flex: none; }
}
// status-count.component.scss (additions)
@include compact {
  .group { flex-wrap: wrap; justify-content: center; }
  .pill  { padding: 0 10px; font-size: 14px; }
}
```

**Known trade-off:** ticking a row changes the details card, which is now below the status pills and out of sight on a phone. Nothing scrolls by itself. If that is a problem, see choice 9 in section 11.

---

## 3. Data and services

### 3.1 `ProgressService` (core)

One live list of downloads for the whole app. Singleton, subscribes once, throttled to about 4 updates a second (shared spec, 6.6: "the page or service should throttle updates").

```ts
// core/services/progress.service.ts
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = inject(ApiService);

  /** every download the backend knows about for this session, newest state */
  readonly items: Signal<DownloadItem[]> = toSignal(
    this.api.downloads$().pipe(auditTime(250)),
    { initialValue: [] },
  );
}
```

`History` can later read finished items from the same signal or from `api.history()`. This spec only needs `items`.

### 3.2 `DownloadService` (core, addition)

The Flow spec created it with `start(requests)`. Add:

```ts
control(action: DownloadAction, ids: string[]): Observable<void> {
  return this.api.control(action, ids);
}
```

### 3.3 What counts as what

```ts
const IN_PROGRESS: DownloadStatus[] = ['queued', 'downloading', 'paused', 'processing'];
const PAUSABLE:    DownloadStatus[] = ['queued', 'downloading', 'paused'];   // processing (ffmpeg) cannot be paused. Also the statuses Priority may act on
```

| Pill | Counts | List shows when pressed |
|---|---|---|
| **Done** | status `done` | only done items, newest `finishedAt` first |
| **Downloading** | status in `IN_PROGRESS` | the queue (same as no pill pressed) |
| **Failed** | status `failed` | only failed items, newest `finishedAt` first |

**No pill pressed** = the queue (`IN_PROGRESS` items), sorted by `priority` ascending. Pressing a pill shows that status only. Pressing the pressed pill goes back to the queue. Only one pill can be pressed.

---

## 4. Components

### 4.1 `DownloadsComponent` (smart)

```ts
export type StatusFilter = 'done' | 'downloading' | 'failed';

@Component({ selector: 'd4m-downloads', /* imports: shared pieces + StatusCountComponent, RouterLink */
  templateUrl: './downloads.component.html', styleUrl: './downloads.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush })
export class DownloadsComponent {
  private readonly progress = inject(ProgressService);
  private readonly downloads = inject(DownloadService);

  protected readonly filter = signal<StatusFilter | null>(null);
  protected readonly selectedIds = signal<string[]>([]);      // order matters: the last one drives the details card
  protected readonly error = signal<string | null>(null);

  private readonly all = this.progress.items;

  protected readonly counts = computed(() => ({
    done:        this.all().filter(i => i.status === 'done').length,
    downloading: this.all().filter(i => IN_PROGRESS.includes(i.status)).length,
    failed:      this.all().filter(i => i.status === 'failed').length,
  }));

  protected readonly visible = computed(() => {
    const f = this.filter();
    if (f === 'done' || f === 'failed') {
      return this.all().filter(i => i.status === f)
                       .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
    }
    return this.all().filter(i => IN_PROGRESS.includes(i.status))
                     .sort((a, b) => a.priority - b.priority);
  });

  /** the card on the right: the last ticked row, else the first row, else nothing */
  protected readonly details = computed(() => {
    const id = this.selectedIds().at(-1);
    return this.all().find(i => i.id === id) ?? this.visible()[0] ?? null;
  });

  private readonly pausable = computed(() => this.all().filter(i => PAUSABLE.includes(i.status)));
  protected readonly allPaused = computed(() => this.pausable().length > 0 && this.pausable().every(i => i.status === 'paused'));
  private readonly priorityIds = computed(() => {
    const sel = new Set(this.selectedIds());
    return this.visible().filter(i => sel.has(i.id) && PAUSABLE.includes(i.status)).map(i => i.id);
  });

  protected readonly toolbar = computed<NavButton[]>(() => [
    { id: 'pause-all', label: 'Pause all', variant: 'ghost', pressed: this.allPaused(), title: this.allPaused() ? 'Resume all' : undefined, disabled: this.pausable().length === 0 },
    { id: 'priority',  label: 'Priority',  variant: 'ghost', icon: 'arrow-up',          disabled: this.priorityIds().length === 0 },
  ]);

  protected onToolbar(id: string): void {
    if (id === 'pause-all') {
      if (this.allPaused()) {
        this.run('resume', this.pausable().map(i => i.id));
      } else {
        this.run('pause', this.pausable().filter(i => i.status !== 'paused').map(i => i.id));
      }
    }
    if (id === 'priority') this.run('prioritize', this.priorityIds());
  }

  protected onAction(e: DownloadActionEvent): void { this.run(e.type, [e.id]); }

  private run(action: DownloadAction, ids: string[]): void {
    this.error.set(null);
    this.downloads.control(action, ids).subscribe({ error: () => this.error.set("Couldn't do that. Try again.") });
  }
}
```

```html
<h1 class="visually-hidden">Downloads</h1>

<d4m-page-container size="lg" padding="split" layout="split">
  <section main aria-label="Download queue">
    <d4m-item-container [items]="visible()" [selectable]="true" [visibleRows]="5" [(selectedIds)]="selectedIds">
      <d4m-nav-buttons toolbar size="sm" [buttons]="toolbar()" (pressed)="onToolbar($event)" />
      <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
        <d4m-download-info variant="small" [item]="item" [selectable]="true"
                           [selected]="sel" (selectedChange)="toggle()" (action)="onAction($event)" />
      </ng-template>
      <div empty class="dl__empty">
        @if (filter() === null) {
          <p>No downloads yet.</p>
          <a class="btn btn--primary" routerLink="/">Paste a link</a>
        } @else {
          <p>No {{ filter() === 'done' ? 'finished' : 'failed' }} downloads.</p>
        }
      </div>
    </d4m-item-container>
    @if (error()) { <p class="dl__error" role="alert">{{ error() }}</p> }
  </section>

  <section side class="dl__side" aria-label="Download details">
    <d4m-panel><d4m-status-count [counts]="counts()" [(value)]="filter" /></d4m-panel>
    <d4m-panel class="dl__details">
      @if (details(); as item) {
        <d4m-download-info variant="big" [item]="item" (action)="onAction($event)" />
      } @else {
        <p class="dl__none">Nothing to show yet.</p>
      }
    </d4m-panel>
  </section>
</d4m-page-container>
```

```scss
// tokens only
.dl__side { display: flex; flex-direction: column; gap: 16px; min-width: 0; height: 100%; }
.dl__details { flex: 1; gap: 14px; }
.dl__empty, .dl__none { text-align: center; color: var(--color-text-muted); font-size: 14px; font-weight: 600; }
.dl__error { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--color-danger); }
```

### 4.2 `d4m-status-count` (dumb)

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `counts` | `{ done: number; downloading: number; failed: number }` (required) | | |
| `value` | `model<StatusFilter \| null>` | `null` | two-way. `null` = no pill pressed |

Renders `<div role="group" aria-label="Filter by status">` with three `.pill` buttons (4.5 row 8): a 10 px dot, then `{{count}} {{name}}`. `aria-pressed` is true for the one matching `value`. Clicking an unpressed pill sets `value` to it. Clicking the pressed one sets `null`. Counts above 999 show as "999+". Dot colours in section 2.

---

## 5. Behaviour in detail

| Action | Result |
|---|---|
| Page opens | queue shown, nothing ticked, details card shows the **first row**. New downloads that came from the Options page are at the bottom as `queued` or `downloading` |
| Tick a row | that row is highlighted. The details card shows it. With several ticked, the **last ticked** one is shown |
| **Select all** | ticks every row in the current list. Pressed while all are ticked: clears |
| Row **pause** / **resume** | `control('pause' / 'resume', [id])` |
| Row **cancel** | `control('cancel', [id])`. The item leaves the list (partial file is deleted by the backend). It does **not** go to History |
| Row **retry** (failed) | `control('retry', [id])`. The item returns to the queue as `queued` |
| Row **dismiss** (done, failed) | `control('dismiss', [id])`. Hides it from this list only. **The History record stays.** (Deleting a record is `remove`, used only on the History page) |
| **Pause all** | acts on **every** pausable item (queued ones too, otherwise they would start as soon as a slot frees up), not only the ticked ones. If any are running it pauses them, and the button becomes **pressed**. Pressed again it resumes all paused items. `processing` items are not touched |
| **Priority ↑** | `control('prioritize', ids)` for the ticked in-progress rows. They move to the top of the queue, keeping their order among themselves. Disabled when none of the ticked rows can be prioritised |
| Press a status pill | list switches (section 3.3). Ticks on rows that are no longer in the list are dropped by `item-container` |
| Live updates | rows and the details card update about 4 times a second. No timers in components |

**Actions by status** come from `d4m-download-info` (6.6): queued shows cancel; downloading shows pause and cancel; paused shows resume and cancel; processing shows no buttons; done shows dismiss; failed shows error text, retry and dismiss. In `small` and `big` the last button emits `dismiss` (its `aria-label` is "Dismiss"). Only the `history` variant emits `remove`.

---

## 6. States

| State | What the user sees |
|---|---|
| Default | 5 rows visible, first row in details, no pill pressed |
| Empty (no downloads at all) | "No downloads yet." and a **Paste a link** button to Home. Details card says "Nothing to show yet.". Pills show 0 |
| Empty filter | "No finished downloads." or "No failed downloads." |
| Processing row | full bar in `--color-apply` (amber), text "Processing…", no buttons |
| Paused row | frozen bar, "Paused", resume and cancel |
| Failed row | error text from `item.error`, retry and dismiss |
| All paused | **Pause all** pressed (filled) |
| Request failed | red text under the list: "Couldn't do that. Try again." |
| Long title / no thumbnail / unknown size or ETA | ellipsis with full title in `title`; neutral thumb box; `—` |
| 100+ rows | virtual scroll stays smooth, counts show "999+" over 999 |
| Compact layout (720px and narrower) | one column: queue, then status pills, then details. Rows without a thumb box. Section 2.1 |

---

## 7. Accessibility

- Visually hidden `<h1>`. Both sections have `aria-label`.
- Pause all is a toggle button (`aria-pressed`). Its **label stays "Pause all"**, as in the design. It gets `title="Resume all"` while pressed (the new `NavButton.title`, section 9).
- Row buttons carry the item title in `aria-label` ("Pause Rocket landing, full broadcast"), like the design.
- Status pills are a labelled group. The state is never colour alone: each pill has its count and name.
- Progress is exposed with `role="progressbar"` and `aria-valuenow` (done inside `download-info`). Do **not** announce every tick. Only the summary and the error message are live regions.
- Focus ring on every control (4.7). Tab order: Select all, Pause all, Priority, rows (checkbox, pause, cancel), status pills, details card buttons.

---

## 8. Mock data for Downloads

`MOCK_DOWNLOADS` (design values). Default settings for every item: mp4, 1080p, bit-rate 300, captions off.

| # | Title | Status | % | Speed | Done / total | ETA |
|---|---|---|---|---|---|---|
| 1 | Rocket landing, full broadcast | downloading | 67 | 17.2 MB/s | 412 / 615 MB | 40 hrs |
| 2 | How tides actually work | downloading | 42 | 9.8 MB/s | 118 / 280 MB | 12 min |
| 3 | Street food tour: Alexandria | downloading | 18 | 4.1 MB/s | 203 / 1,120 MB | 3 hrs |
| 4 | Lo-fi study mix, 2 hours | downloading | 91 | 21.5 MB/s | 874 / 960 MB | 6 sec |
| 5 | Desert timelapse in 4K | **processing** | 100 | none | 640 / 640 MB | none |
| 6 | Interview: building a boat | downloading | 34 | 6.3 MB/s | 88 / 260 MB | 28 min |
| 7 | Keyboard sound test | downloading | 8 | 2.2 MB/s | 12 / 150 MB | 1 hr |

Plus, so every state can be tried: one `queued`, one `paused`, **4 `done`** and **2 `failed`** (with an `error` text such as "Video unavailable"), one item with a very long title, one with no thumbnail, one with unknown total size.

`MockApiService`:
- `downloads$()` emits the full list every second. Each `downloading` item advances by its speed. At 100 % it becomes `processing` for 3 seconds, then `done` with `finishedAt` set.
- At most **3 items download at once**, the rest stay `queued` (so Priority has a visible effect). When one finishes, the lowest-priority-number queued item starts.
- `startDownloads(requests)` (from the Options page) adds the items as `queued`, with new priorities at the end.
- `control()`: `pause` sets `paused` (speed and ETA null), `resume` returns to `queued`, `cancel` and `dismiss` delete the item from the live list (`dismiss` keeps its history record), `retry` sets `queued` and clears `error`, `prioritize` gives the ids the lowest priority numbers.

---

## 9. Changes to other specs (applied in shared spec rev 3; kept here as a record)

**Shared components spec**
- Section 3 models: `DownloadAction` gains **`'prioritize'`** and **`'dismiss'`**: `'pause' | 'resume' | 'cancel' | 'retry' | 'remove' | 'prioritize' | 'dismiss'`. `dismiss` = hide from Downloads, keep the history record. `remove` = delete the history record (History page only).
- 6.3 `NavButton` gains **`pressed?: boolean`** (sets `aria-pressed` and the pressed look of the ghost button, 4.5 row 6) and **`title?: string`** (native tooltip). Pause all uses `title: 'Resume all'` while pressed.
- 6.6 `download-info`: the progress bar has `role="progressbar"` with `aria-valuenow` (0 to 100) and `aria-label` ("Progress of <title>"). It is not a live region.
- 6.6 table: a **queued** row has only cancel. A queued item can still be paused by **Pause all** (it becomes `paused` and then shows resume and cancel).
- Section 5 icon names gain **`arrow-up`**.
- 6.6 and 4.6.8: the progress bar fill is `--color-apply` while `status === 'processing'` (as in the design). Clarify that `download-info` `big` renders **only its content**, and the page puts it in a `d4m-panel`.
- Section 3 helper `formatSize(bytes, unit = 'auto')`: the progress line here (`203 / 1,120 MB`) must use **`'mb'`** (always MB, thousands separator), as in the design. `'auto'` is defined in the History spec.
- 6.7 `item-container`: **toggling a row appends its id to the end of `selectedIds`** (the order is meaningful, the details card uses the last one). Select all keeps list order.
- 6.6 stays as written for `processing`: **no buttons**. The design shows pause and cancel on the processing row. We do not follow it, because ffmpeg merging cannot be paused.

**Flow spec**
- `core/services/download.service.ts` gets `control()` (section 3.2 above).

**Session handoff**
- `features/downloads/` is `downloads.component.*` plus `components/status-count/`. `progress.service.ts` already exists in the core tree.

---

## 10. Done when

- [ ] 7 design rows render with correct bar, percent, speed, size and ETA, in light and dark.
- [ ] Ticking rows highlights them, updates "N of M selected", and the details card follows the last ticked row. With none ticked it shows the first row.
- [ ] Row pause, resume, cancel, retry and dismiss send the right `control()` call with that row's id.
- [ ] Pause all pauses everything pausable, shows pressed, and resumes on the second press. It does not touch `processing` items.
- [ ] Priority ↑ moves only the ticked in-progress rows to the top. It is disabled when none qualify.
- [ ] The three pills show correct counts, filter the list, and toggle back to the queue.
- [ ] Rows and the details card update live with no flicker and no layout shift between statuses.
- [ ] Empty, empty-filter, processing, paused, failed and error states look right.
- [ ] 100+ mock rows scroll smoothly.
- [ ] Compact layout (390px wide, light and dark): the queue on top, then the status pills (wrapping if needed), then the details card. Rows have no thumb box and show `speed · ETA`. The list header wraps. No horizontal scroll.
- [ ] Passes the checklist in section 9 of the shared spec.

---

## 11. Choices I made that you can change

1. **Counts.** The design says "6 Downloading" next to 7 rows, because the processing row is the seventh. Here **Downloading counts every in-progress item** (queued, downloading, paused, processing), so the mock shows 7. If you want processing excluded, change `IN_PROGRESS` in the count only.
2. **Done and failed items appear in Downloads** only when their pill is pressed. The default list is the queue. History (separate page) keeps the permanent record.
3. **Cancel** removes the item and leaves no trace. **Dismiss** on a done or failed row only hides it from this page, History keeps the record.
4. **Pause all** acts on all pausable downloads, not only the ticked ones, and its label never changes. Alternative: swap the label to "Resume all".
5. **Priority ↑** means "move to the top of the queue". With more than 3 downloads it decides which ones run first.
6. **Details card** follows the last ticked row, and falls back to the first row. Alternative: an empty card until something is ticked.
7. **Backend contract assumption.** `ApiService.downloads$()` must include every download of the current session, **finished and failed ones too** (that is what the Done and Failed pills count). `ApiService.history()` stays the permanent record across sessions. Tell whoever builds the real backend.
8. No "open file / open folder" on finished downloads in v1 (open decision 7 of the shared spec).
9. **Compact order.** The side blocks keep their DOM order: queue, status pills, details. Alternative: in the compact layout put the status pills **above** the queue (they filter it), or the details card directly under the queue so a tick is visible at once. Both need a CSS `order` change and change the Tab order, so they are not done by default.
