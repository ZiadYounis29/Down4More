# Down4More: Playlist Select Page Spec (step 1)

> **Scope:** `features/playlist/select/`. Companions: `Down4More-Playlist-Flow-Spec.md` (state service, routes, guards, mock data: read it first), `Down4More-Shared-Components-Spec.md` (tokens, `page-container`, `item-container`, `media-thumbnail`, `nav-buttons`).
> **Design source:** the pre-select screen in the Excalidraw SVG: a "select all" button top left, a list of rows (name and duration only), and "next" bottom right. It is the same container as the Options page with selection always on and no settings panel.
> **Backend:** none. The page reads what Home already fetched.

---

## 0. The page in one minute

The user sees every video that Home fetched, all ticked. They untick what they do not want, optionally use **Select all** to tick or clear everything, and press **Next**. Next is disabled when nothing is ticked.

---

## 1. Route and files

| | |
|---|---|
| Route | `/playlist/select` (guard: `hasFetchResultGuard`) |
| Component | `PlaylistSelectComponent`, selector `d4m-playlist-select`, standalone, OnPush |
| Files | `features/playlist/select/playlist-select.component.ts / .html / .scss` |
| State | `PlaylistStateService` (reads `items`, `failedCount`, two-way `chosenIds`) |

**Shared pieces used:** `d4m-page-container`, `d4m-item-container`, `d4m-media-thumbnail` (variant `pre-select`), `d4m-nav-buttons`. No new components.

---

## 2. Layout

```
┌────────────────────────────────────────────────────────────┐
│  2 links couldn't be loaded.                  (only if any) │
│  [ Select all ]                              9 of 9 selected │
│  ┃ ☑ [▶]  Rocket landing, full broadcast        Duration    │
│  ┃                                              12:48       │
│  ┃ ☑ [▶]  How tides actually work               Duration    │
│  ┃  ...5 rows visible, the rest scrolls...                   │
│                                                    [ Next › ] │
└────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Card | `<d4m-page-container size="md">`, default padding. (`md` = 920 wide. The rows have only two columns of data, so the narrower card fits them better than `lg`) |
| Heading | a visually hidden `<h1>` "Choose videos" (the design has no visible title) |
| Failed notice | only when `failedCount() > 0`, in the card's `[header]` slot, margin-bottom 14, 13 / 700, `--color-danger`, `role="status"`. Text: "1 link couldn't be loaded." / "N links couldn't be loaded." |
| List | `d4m-item-container`, `selectable`, `visibleRows = 5` (the SVG shows 5 rows; the same count as the Options page, so the card height stays the same between steps), `selectAllLabel = "Select all"`, default summary "N of M selected" |
| Row | `d4m-media-thumbnail variant="pre-select"`: checkbox, thumb box 84 x 56, title (one line, ellipsis), then one meta column: label "Duration" (13 / 700 muted) over the value (15 / 700). **No file size** (the SVG's pre-select rows have none). Look: shared spec 4.6.10 |
| Footer | `[footer]` slot with one button: **Next** (primary, end side, chevron-right, size `md`). In the compact layout Next fills the row (`fullWidth="compact"`, shared spec 6.3) |

> The SVG shows **only Next**, no Back. The shared spec's reuse matrix listed Back as well. This page follows the SVG: the way back is the logo in the nav bar. Add `navBack()` (start side, navigates to `/`) if you want it. Note that Home keeps its links in the component only, so they would be empty on return unless Home also restores them from `FetchInfoService` (not specified yet).

---

## 2.1 Code

```ts
@Component({
  selector: 'd4m-playlist-select',
  imports: [PageContainerComponent, ItemContainerComponent, ItemTemplateDirective,
            MediaThumbnailComponent, NavButtonsComponent],
  templateUrl: './playlist-select.component.html',
  styleUrl: './playlist-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistSelectComponent {
  protected readonly state = inject(PlaylistStateService);
  private readonly router = inject(Router);

  protected readonly buttons = computed<NavButton[]>(() => [
    { ...navNext(), disabled: this.state.chosenIds().length === 0 },
  ]);

  protected readonly failedText = computed(() => {
    const n = this.state.failedCount();
    return `${n} ${n === 1 ? 'link' : 'links'} couldn't be loaded.`;
  });

  protected onPressed(id: string): void {
    if (id === 'next') this.router.navigate(['/playlist', 'options']);
  }
}
```

```html
<h1 class="visually-hidden">Choose videos</h1>

<d4m-page-container size="md">
  @if (state.failedCount() > 0) {
    <p header class="sel__notice" role="status">{{ failedText() }}</p>
  }

  <d4m-item-container [items]="state.items()" [selectable]="true" [visibleRows]="5"
                      selectAllLabel="Select all" [(selectedIds)]="state.chosenIds">
    <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
      <d4m-media-thumbnail variant="pre-select" [item]="item" [selected]="sel" (selectedChange)="toggle()" />
    </ng-template>
  </d4m-item-container>

  <d4m-nav-buttons footer fullWidth="compact" [buttons]="buttons()" (pressed)="onPressed($event)" />
</d4m-page-container>
```

```scss
// tokens only
.sel__notice { margin: 0 0 14px; font-size: 13px; font-weight: 700; color: var(--color-danger); }
```

`.visually-hidden` is a global utility class in `styles.scss` (add it once if it is not there yet).

---

## 2.2 Compact layout (rev 3)

At 720px and narrower (shared spec 4.4). This page is already one column, so nothing moves. Only sizes and rows change. **No design exists for it, so everything here is assumed** and derived from the Single compact layout.

```
┌──────────────────────────┐
│ 2 links couldn't be loaded.│
│ [ Select all ]  9 of 9 selected │
│ ┃ ☑ [▶] Rocket landing, full…  │
│ ┃       12:48                  │
│ ┃ ☑ [▶] How tides actually…    │
│ ┃  ...5 rows visible...        │
│ [        Next ›        ]       │
└──────────────────────────┘
```

| Part | Compact rule |
|---|---|
| Card | padding `24px 16px` (page-container rule). Still `size="md"` |
| Failed notice | wraps to two lines if needed |
| Header | Select all and the summary stay on one line. If they do not fit, the summary wraps under the button (shared 6.7) |
| Row | the compact row of shared 4.6.10: checkbox, thumb 84 x 56, title (one line, ellipsis) with the duration **under** it as `12:48` (`—` when unknown) in place of the "Duration" meta column. Height stays 82, 5 rows visible |
| Next | fills the row (`fullWidth="compact"`) |

---

## 3. Behaviour

| Action | Result |
|---|---|
| Page opens | every video is ticked (the state service ticks all on a new result). Coming back from Options keeps the previous ticks |
| Click a row, or its checkbox | toggles that video (`pre-select` row click toggles the checkbox, shared spec 6.5) |
| **Select all** | ticks every video. Pressed while all are ticked: clears every tick (shared spec 6.7) |
| Summary text | "N of M selected", updated live |
| **Next** | navigates to `/playlist/options`. Disabled when 0 ticked. **No backend call** |
| Refresh on this page | the in-memory result is gone, so `hasFetchResultGuard` sends the user to Home |

The list order is the order Home returned (links in the order added, each playlist expanded in place).

---

## 4. States

| State | What the user sees |
|---|---|
| Default | all rows ticked, "9 of 9 selected", Select all pressed, Next enabled |
| Some ticked | partial summary, Select all not pressed |
| None ticked | "0 of 9 selected", Next **disabled** |
| Some links failed | red notice above the list (from `FetchResult.failed`) |
| 1 video only | works the same ("1 of 1 selected") |
| 300 videos | virtual scroll stays smooth (mock link with `big`) |
| Long title / no thumbnail / unknown duration | title ellipsis with full text in `title`, neutral placeholder box, duration shows `—` |
| Compact layout (720px and narrower) | card padding `24px 16px`, rows with the duration under the title, Next fills the row, the list keeps 5 rows. Section 2.2 |

There is no empty state: with no items the guard redirects to Home.

---

## 5. Accessibility

- The visually hidden `<h1>` names the page. Focus is **not** moved on route change beyond Angular's default.
- Rows and Select all are real buttons or checkboxes from the shared components (visible focus ring, `aria-pressed`).
- The summary is inside an `aria-live="polite"` region (it lives in `item-container`).
- Failed notice uses `role="status"`; the colour is never the only signal because the text says "couldn't be loaded".
- Tab order: Select all, rows, Next.

---

## 6. Done when

- [ ] Opening the page after a playlist fetch shows all videos ticked and Next enabled.
- [ ] Select all, single clicks and the summary text agree with each other.
- [ ] Next is disabled with 0 ticked and goes to `/playlist/options` otherwise.
- [ ] Back from Options returns here with the same ticks.
- [ ] Refreshing the page lands on Home.
- [ ] The failed notice appears only when `failed` is not empty.
- [ ] 5 rows visible, 300 mock items scroll smoothly, long title and missing data look right.
- [ ] Compact layout (390px wide, light and dark): duration under each title, Next fills the row, no horizontal scroll.
- [ ] Looks match the SVG in light and dark, and passes the checklist in section 9 of the shared spec.
