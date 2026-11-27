# Down4More: History Page Spec

> **Scope:** `src/app/features/history/` plus the core pieces it needs (`HistoryService`, `formatWhen`, a `formatSize` unit). Companions: `Down4More-Shared-Components-Spec.md` (tokens, `page-container`, `item-container`, `download-info`), `Down4More-Downloads-Page-Spec.md` (the live queue, same row logic and actions), `Down4More-Core-Shell-Spec.md`.
> **Design sources:** `Down4More-History.html` (both themes) and the History screens in the Excalidraw SVG (search bar, rows with a name and a date, "succeeded" / "failed", Retry, x). The SVG has no select-all here, and neither does the final design, so **this page has no selection**.
> **Backend:** none yet. Everything goes through `ApiService.history()` and `ApiService.control()` and the mock.

---

## 0. The page in one minute

A search box on top. Below it, every finished download, newest first, as a solid **green** row (succeeded) or **red** row (failed). Each row shows the name, when it finished, quality, format, size, a status chip, and buttons: **Retry** (failed rows only) and **Remove** (all rows). The footer says "8 of 8 items". Typing in the search box filters the list instantly by name.

---

## 1. Route and files

| | |
|---|---|
| Route | `/history`, lazy `loadComponent`. The nav bar link is active here |
| Component | `HistoryComponent`, selector `d4m-history`, standalone, OnPush |

```
features/history/
├─ history.component.ts / .html / .scss          (smart: loads, filters, handles actions)
└─ components/
   └─ search-bar/   d4m-search-bar               (dumb: the search panel)
core/
├─ services/history.service.ts                   (section 3.1)
├─ utils/format-when.ts                          (section 3.2, with .spec.ts)
└─ utils/format-size.ts                          (exists: gains the 'auto' unit, section 3.3)
```

**Shared pieces used:** `d4m-page-container` (`size="lg"`, `padding="split"`, stack layout), `d4m-item-container` (not selectable), `d4m-download-info` (variant `history`), `d4m-panel`-style search panel (inside `d4m-search-bar`). **No `nav-buttons`**: the design has no toolbar. (The shared spec's reuse matrix listed "Retry selected, Clear". Those are dropped, section 11.)

---

## 2. Layout and look

### 2.1 Page

```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [🔍 Search]  [ enter a name…                           ] │ │  <- search panel
│ └──────────────────────────────────────────────────────────┘ │
│ ┃ [▶] Rocket landing, full broadcast   Quality│Format│Size  [Succeeded] [✕]       │  green row
│ ┃     Today, 14:32                      1080p │ mp4  │615 MB                     │
│ ┃ [▶] How tides actually work           720p  │ mp4  │280 MB  [  Failed  ] [↻][✕] │  red row
│ ┃  ...5 rows visible, the rest scrolls...                                          │
│ 8 of 8 items                                                                       │
└──────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Card | `<d4m-page-container size="lg" padding="split">`: max-width 1040, padding `32px 40px 36px`. (The design file has 30 at the bottom. We use the shared `split` value so all pages match.) In the compact layout (720px and narrower) the card padding is `24px 16px` and the shell `16px 16px 32px` (shared spec 4.4). **(rev 3)** This said `20px`, which contradicted the shared rule |
| Heading | visually hidden `<h1>` "History" |
| Search | `<d4m-search-bar header>` in the card's `[header]` slot (section 2.2) |
| List | `d4m-item-container`, `selectable = false` (no header, no checkboxes), `visibleRows = 5` (the design's list is 452 px), custom scroll rail as everywhere (4.6.11) |
| Footer | `<p footer>` "N of M items", margin-top 14, 14 / 600 `--color-text-muted`. Hidden when M = 0 |

### 2.2 Search panel (`d4m-search-bar`)

Panel fill `--color-bg`, radius 18 (`--radius-panel`), padding 12, margin-bottom 14. Inside: flex, gap 10.

| Part | Spec |
|---|---|
| Search button | height 42, padding `0 20px`, radius 12 (`--radius-control`), border `--field-border`, fill `--field-bg`, 15 / 700, search icon 18, gap 8, label "Search". Hover: border colour `--color-primary` |
| Input | flex 1, `min-width: 0`, height 42, padding `0 14px`, radius 12, 15 / 600, border `--field-border`, fill `--field-bg`. Placeholder "enter a name…" |
| Focus | both: `outline: 2px solid var(--color-accent); outline-offset: 2px` (4.7) |

### 2.3 Row (`d4m-download-info variant="history"`)

This section **is** the spec of the `history` variant. It replaces the short description in shared spec 6.6.

| Part | Spec |
|---|---|
| Row | flex, `align-items: center`, gap 14, height `--row-height` (82), padding `0 14px`, radius 18, border 1px, text `--color-on-history`. It is a `<div>` (it contains buttons). Fill, border and label colour come from the status (below) |
| Thumb box | 84 x 56, radius 12, fill `--color-surface`, **no border**, play icon 26 in `--box-fg` (`d4m-thumb-box` with `bordered = false`) |
| Name block | flex 1, `min-width: 0`. Title 15 / 700, one line, ellipsis, full title in `title`. Under it, margin-top 4, the **date** 12 / 700 in the label colour |
| Meta | flex, gap 14, `flex: none`. Three columns **Quality**, **Format**, **Size**, each `min-width: 58`, label 12 / 700 in the label colour over a value 15 / 700. A 1px divider in the label colour between columns |
| Chip | `flex: none`, width 96, centred, 12 / 800, padding `5px 0`, pill, fill `--color-on-history` (white), text = the row's fill colour. Text **"Succeeded"** or **"Failed"** |
| Actions | flex, gap 8, `flex: none`, **width 76**, `justify-content: flex-end` (so rows line up with one or two buttons). **Retry** (failed rows only, icon `retry` 15) and **Remove** (all rows, icon `x` 14, stroke 2.6). Both `.btn--icon.btn--sm` (34 x 34, radius 10) with the `.btn--on-color` look: 2px white border, white icon. **Hover:** fill white, icon in the row's fill colour |
| Narrow | under 860px hide the Format column and its divider. In the compact layout (720px and narrower) hide the whole meta block and make the chip 84 wide. **(rev 3)** The 860px rule is a documented exception to the one-breakpoint rule (shared spec 4.4): the row content does not fit, the page layout does not change |

**Row colours** (new tokens, section 9):

| | Fill | Border | Label colour |
|---|---|---|---|
| Succeeded (`status = 'done'`) | `--color-history-ok` | `--color-history-ok-border` | `--color-history-ok-label` |
| Failed (`status = 'failed'`) | `--color-history-err` | `--color-history-err-border` | `--color-history-err-label` |

**Row content from the data**

| Shown | From |
|---|---|
| Title | `item.title` |
| Date | `formatWhen(item.finishedAt)` (3.2) |
| Quality | `settings.quality`, or **"Audio"** when `settings.mode === 'audio-only'` (quality is null) |
| Format | `settings.format` |
| Size | `formatSize(item.totalBytes ?? item.sizeBytes ?? null)` (`'auto'` unit, 3.3). `—` if unknown. Failed rows show the planned size |
| Chip | `done` shows "Succeeded", `failed` shows "Failed" (the model says `done`, the UI says "Succeeded") |

---

## 3. Data and services

### 3.1 `HistoryService` (core)

```ts
// core/services/history.service.ts
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly api = inject(ApiService);
  private readonly _items = signal<HistoryEntry[]>([]);

  readonly items = this._items.asReadonly();
  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');

  /** one-shot load. api.history() must complete after emitting */
  load(): void {
    this.status.set('loading');
    this.api.history().subscribe({
      next: list => { this._items.set(list as HistoryEntry[]); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }

  /** call after a Retry or Remove succeeded: the entry leaves the list */
  drop(id: string): void { this._items.update(list => list.filter(i => i.id !== id)); }
}
```

The service holds the **whole** list. Searching happens in the page (instant, no backend call). ⚙ **Backend later:** if history grows to thousands, pass the text to `api.history(query)` with a 250 ms debounce instead. `ApiService.history(query?)` already allows it, only the page's `shown` changes.

### 3.2 `formatWhen` (core/utils, pure, unit-tested)

```ts
export function formatWhen(iso: string, now: Date = new Date()): string;
```

Uses the **local** time zone. Builds the text from fixed arrays (`Mon..Sun`, `Jan..Dec`), not from `Intl`, because `Intl` output differs between browsers ("Mon, 23 Nov" vs "Mon 23 Nov").

| Finished | Output | Example |
|---|---|---|
| today | `Today, HH:mm` (24 h) | `Today, 14:32` |
| yesterday | `Yesterday` | `Yesterday` |
| earlier, same year | `Ddd D Mmm` | `Mon 23 Nov` |
| other year | `D Mmm YYYY` | `23 Nov 2025` |

Tests (required), with `now = 2026-11-27 15:00` local: 14:32 today; 00:01 today; 23:59 yesterday; 23 Nov; 31 Dec 2025; 1 Jan 2026 (same year); invalid string gives `—`.

### 3.3 `formatSize` gets a unit

```ts
export function formatSize(bytes: number | null, unit: 'auto' | 'mb' = 'auto'): string;
```

| Input | `'auto'` (History) | `'mb'` (Downloads progress) |
|---|---|---|
| `null` | `—` | `—` |
| 41 943 040 | `40 MB` | `40 MB` |
| 644 874 240 | `615 MB` | `615 MB` |
| 1 174 405 120 | `1.1 GB` | `1,120 MB` |
| 2 147 483 648 | `2.0 GB` | `2,048 MB` |

`'auto'`: below 1 GB show whole MB, from 1 GB show one decimal in GB (1024-based). `'mb'`: always whole MB with a thousands separator, as in the Downloads design ("203 / 1,120 MB"). Add both columns as unit tests.

---

## 4. Components

### 4.1 `HistoryComponent` (smart)

```ts
@Component({ selector: 'd4m-history', /* imports: page-container, item-container, download-info, search-bar */
  templateUrl: './history.component.html', styleUrl: './history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush })
export class HistoryComponent {
  private readonly history = inject(HistoryService);
  private readonly downloads = inject(DownloadService);

  protected readonly query = signal('');
  protected readonly status = this.history.status;
  protected readonly error = signal<string | null>(null);     // action failed
  protected readonly notice = signal('');                     // spoken only (live region)

  protected readonly total = computed(() => this.history.items().length);

  /** newest first */
  private readonly sorted = computed(() =>
    [...this.history.items()].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)));

  protected readonly shown = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.sorted().filter(i => i.title.toLowerCase().includes(q)) : this.sorted();
  });

  protected readonly countText = computed(() =>
    `${this.shown().length} of ${this.total()} ${this.total() === 1 ? 'item' : 'items'}`);

  constructor() { this.history.load(); }

  protected reload(): void { this.history.load(); }

  protected onAction(e: DownloadActionEvent): void {        // only 'retry' and 'remove' come from this variant
    const item = this.history.items().find(i => i.id === e.id);
    this.error.set(null);
    this.downloads.control(e.type, [e.id]).subscribe({
      next: () => {
        this.history.drop(e.id);
        this.notice.set(e.type === 'retry'
          ? `Retrying ${item?.title}. It is back in Downloads.`
          : `Removed ${item?.title} from history.`);
      },
      error: () => this.error.set("Couldn't do that. Try again."),
    });
  }
}
```

```html
<h1 class="visually-hidden">History</h1>

<d4m-page-container size="lg" padding="split">
  <d4m-search-bar header [(value)]="query" />

  <d4m-item-container [items]="shown()" [selectable]="false" [visibleRows]="5">
    <ng-template d4mItem let-item>
      <d4m-download-info variant="history" [item]="item" (action)="onAction($event)" />
    </ng-template>

    <div empty class="hist__empty">
      @switch (status()) {
        @case ('loading') { <p role="status">Loading history…</p> }
        @case ('error') {
          <p>Couldn't load history.</p>
          <button type="button" class="btn btn--sm btn--ghost" (click)="reload()">Try again</button>
        }
        @default {
          <p>{{ total() === 0 ? 'No history yet. Finished downloads show up here.'
                              : 'Nothing in history matches your search.' }}</p>
        }
      }
    </div>
  </d4m-item-container>

  @if (error()) { <p class="hist__error" role="alert">{{ error() }}</p> }
  @if (total() > 0) { <p footer class="hist__count" aria-live="polite">{{ countText() }}</p> }
</d4m-page-container>

<p class="visually-hidden" aria-live="polite">{{ notice() }}</p>
```

```scss
// tokens only
.hist__empty { padding: 40px 10px; text-align: center; color: var(--color-text-muted); font-weight: 600; }
.hist__count { margin: 14px 0 0; font-size: 14px; font-weight: 600; color: var(--color-text-muted); }
.hist__error { margin: 8px 0 0; font-size: 13px; font-weight: 700; color: var(--color-danger); }
```

### 4.2 `d4m-search-bar` (dumb)

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `value` | `model<string>` | `''` | two-way. Updates on **every keystroke** (live filter) |
| `placeholder` | `string` | `'enter a name…'` | |
| `label` | `string` | `'Search history'` | `aria-label` of the input |

No outputs. The **Search button focuses the input** (filtering is already live). **Escape** inside the input clears it. Markup: `<div class="sb" role="search">` with the button and an `<input type="text" inputmode="search" autocomplete="off" spellcheck="false">`.

---

## 5. Behaviour in detail

| Action | Result |
|---|---|
| Page opens | `HistoryService.load()`. List shows "Loading history…" until it arrives, then newest first |
| Type in the box | list filters at once. Case-insensitive, matches **anywhere in the title**, leading and trailing spaces ignored. Footer becomes "N of M items" |
| Escape in the box | clears the text, full list returns |
| **Search** button | puts the cursor in the box |
| **Retry** (failed row) | `control('retry', [id])`. The download goes **back to the queue** on the Downloads page. The row **leaves History**. A spoken message says so. When it finishes it comes back here as a new entry with a new date |
| **Remove** (any row) | `control('remove', [id])`. **Deletes the history record only, never the downloaded file.** The row disappears. No confirmation, no undo (v1) |
| After Retry or Remove | focus goes to the search box (the row that had it is gone) |
| Request fails | red text under the list "Couldn't do that. Try again.", the row stays |

Order is `finishedAt` descending. There are no date group headers (the date is on every row).

---

## 6. States

| State | What the user sees |
|---|---|
| Loading | empty list area: "Loading history…" |
| Load failed | "Couldn't load history." and a **Try again** ghost button |
| Empty history | "No history yet. Finished downloads show up here." Footer hidden |
| No search match | "Nothing in history matches your search." Footer "0 of 8 items" |
| Default | green and red rows, 5 visible, footer "8 of 8 items" |
| Succeeded row | green, chip "Succeeded", one action (remove) |
| Failed row | red, chip "Failed", two actions (retry, remove) |
| Long title | one line with ellipsis, full text in `title` |
| No thumbnail | neutral thumb box |
| Unknown size or no quality | `—` |
| 100+ entries | virtual scroll stays smooth (mock has 70) |
| Narrow screens | Format column hides under 860px, all meta under 720px |
| Light and dark | same layout, colours from tokens (section 9) |

---

## 7. Accessibility

- Visually hidden `<h1>`. The search panel is `role="search"`.
- Row buttons have the item title in the label: `aria-label="Retry {title}"`, `aria-label="Remove {title} from history"`.
- **Status is never colour alone.** The chip says "Succeeded" or "Failed". For a failed row the chip also has `title="{item.error}"` and the visually hidden text `: {error}` after "Failed", so screen reader users hear why it failed.
- Live regions: the footer count and the hidden notice are `aria-live="polite"`. Nothing announces on scroll.
- **Focus ring on coloured rows is white** (`--color-on-history`, 2px, offset 2), because the accent red is invisible on a red row (4.7 gets this exception).
- **Contrast.** White text on the design's **light** colours is slightly under the 4.5:1 target. Dark theme passes everywhere.

| Light theme | Ratio | Dark theme | Ratio |
|---|---|---|---|
| white on green `#2A8A55` | 4.32 | white on green `#1F7347` | 5.83 |
| green label `#D9F2E4` on green | 3.65 | green label `#CDEBDA` on green | 4.58 |
| white on red `#CC3A4B` | 4.91 | white on red `#B02D3E` | 6.38 |
| red label `#FADCE0` on red | 3.83 | red label `#F5CDD3` on red | 4.42 |

The tokens below use the **design values**. If you want the light theme to pass too, set the light fill tokens to the dark ones (`--color-history-ok: #1F7347`, `--color-history-err: #B02D3E`, borders the same) and keep the labels. That gives 5.83 / 4.93 and 6.38 / 4.98. It is a token change only, no component changes.

- Tab order: Search button, input, then each row's Retry and Remove.

---

## 8. Mock data

`MOCK_HISTORY`, from the design (dates relative to "now" so the labels are always right):

| # | Title | Result | Finished | Quality | Format | Size |
|---|---|---|---|---|---|---|
| 1 | Rocket landing, full broadcast | done | 20 min ago | 1080p | mp4 | 615 MB |
| 2 | How tides actually work | failed | 90 min ago | 720p | mp4 | 280 MB |
| 3 | Street food tour: Alexandria | done | yesterday 18:10 | 1080p | mkv | 1.1 GB |
| 4 | Lo-fi study mix, 2 hours | failed | yesterday 09:40 | Audio (`audio-only`) | mp3 | 96 MB |
| 5 | Desert timelapse in 4K | done | 4 days ago | 2160p | mp4 | 640 MB |
| 6 | Interview: building a boat | failed | 4 days ago | 1080p | webm | 260 MB |
| 7 | Keyboard sound test | done | 5 days ago | 480p | mp4 | 150 MB |
| 8 | Documentary: the Nile delta | done | 6 days ago | 1440p | mkv | 2.0 GB |

Plus so every state can be tried: **62 generated older entries** (alternating done and failed, spread over about 4 months, **one dated in the previous year**), one very long title, one without a thumbnail, one with unknown size, and failed entries with `error` text such as "Video unavailable" or "Network error".

`MockApiService` (one store shared with Downloads):
- `history(query?)` returns every item whose status is `done` or `failed`, newest first, filtered by title when `query` is given. It completes after emitting.
- `control('remove', ids)` deletes the record. `control('retry', ids)` sets the item `queued` (it appears in Downloads, leaves History). `control('dismiss', ids)` does **not** touch History.
- Downloads that finish in the mock become history entries with `finishedAt = now`.

---

## 9. Changes to other specs (applied in shared spec rev 3; kept here as a record)

**Shared components spec**
- **4.2 colour tokens**, seven new, used only by the `history` row:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-history-ok` | `#2A8A55` | `#1F7347` | succeeded row fill, chip text |
| `--color-history-ok-border` | `#2A8A55` | `#2F8F5E` | succeeded row border |
| `--color-history-ok-label` | `#D9F2E4` | `#CDEBDA` | date, meta labels, dividers on a green row |
| `--color-history-err` | `#CC3A4B` | `#B02D3E` | failed row fill, chip text |
| `--color-history-err-border` | `#CC3A4B` | `#C84557` | failed row border |
| `--color-history-err-label` | `#FADCE0` | `#F5CDD3` | same, on a red row |
| `--color-on-history` | `#FFFFFF` | `#FFFFFF` | text, chip fill, icon buttons, focus ring on these rows |

- **4.5 variants list:** new modifier `.btn--on-color` (used with `.btn--icon.btn--sm`): 2px solid `--color-on-history` border, icon in `--color-on-history`, transparent fill. Hover: fill `--color-on-history`, icon colour = the row's fill (`var(--row-bg)`).
- **4.6.9 `d4m-thumb-box`:** new input `bordered: boolean`, default `true`. History rows use `false`.
- **4.7:** focus ring on coloured history rows is `--color-on-history` (section 7).
- **5 icons:** add `search`.
- **6.6 `download-info`:** the `history` variant is exactly section 2.3 above (solid green or red row, Quality / Format / Size columns, white chip, Retry and Remove). It emits `retry` and `remove`. Date comes from `formatWhen`. `small` and `big` emit `dismiss` where this variant emits `remove` (see the Downloads spec).
- **6.7 `item-container`:** confirm that `selectable = false` renders **no header at all** (no Select all, no summary) and no checkbox column.
- **Section 3 helpers:** add `formatWhen`, and the `unit` argument of `formatSize` (3.3 here).
- **Section 7 reuse matrix, History row:** page-container yes, item-container yes, `download-info` `history`, **nav-buttons none**. Handler table: History **Retry** and **Remove** call `control('retry' / 'remove', [id])` as before.

**Downloads spec:** already updated (`dismiss`, `formatSize(…, 'mb')`).

**Session handoff:** `features/history/` is `history.component.*` plus `components/search-bar/`.

---

## 10. Done when

- [ ] All 8 design rows render with the right colours, chip, date, Quality / Format / Size and actions, in light and dark.
- [ ] A failed row has Retry and Remove, a succeeded row only Remove, and the rows still line up.
- [ ] Typing filters by name live, "N of M items" follows, Escape clears, "Nothing in history matches your search." shows when empty.
- [ ] Remove deletes the record. Retry sends the download back to the Downloads queue and the row leaves History. Both announce a spoken message and move focus to the search box.
- [ ] Dates follow section 3.2, sizes follow section 3.3 ("1.1 GB", "615 MB").
- [ ] Loading, load-failed, empty and action-failed states look right.
- [ ] Format column hides under 860px and all meta under 720px.
- [ ] 70 mock entries scroll smoothly. Long title and missing data look right.
- [ ] Focus ring is visible on coloured rows. A failed row exposes its error text to screen readers.
- [ ] `formatWhen` and `formatSize` pass their unit tests. Passes the checklist in section 9 of the shared spec.

---

## 11. Choices I made that you can change

1. **No selection, no toolbar.** The design and the SVG have none. The shared spec's "Retry selected" and "Clear" are dropped. If you want bulk actions later, `item-container` already supports `selectable`.
2. **Search is live and by title only.** The Search button just focuses the box. Alternative: filter only when the button or Enter is pressed.
3. **Retry moves the item back to Downloads** and removes the row from History. The design file's script flips the row to "Succeeded, Today, now" in place. That was a stand-in for the demo and would be wrong with a real backend.
4. **Remove deletes the record only**, never the file on disk, with no confirmation and no undo. Alternative: a confirm step, or an undo message for a few seconds.
5. **History is loaded when the page opens** and does not live-update while open. A download that finishes while you look at History shows up on the next visit. (If you want it live, reload when the number of finished items in `ProgressService` changes.)
6. **Date format:** "Today, 14:32", "Yesterday", "Mon 23 Nov", "23 Nov 2025", as in the design, with a year added for older entries.
7. **Light-theme contrast** keeps the design colours by default (section 7 shows the one-line fix).
8. **Card bottom padding** is the shared `split` 36 instead of the design file's 30.
9. After an action, **focus goes to the search box**, not to the next row. Alternative: move focus to the next row's first button.
