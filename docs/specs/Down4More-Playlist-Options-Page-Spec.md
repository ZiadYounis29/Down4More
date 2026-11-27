# Down4More: Playlist Options Page Spec (step 2)

> **Scope:** `features/playlist/options/`. Companions: `Down4More-Playlist-Flow-Spec.md` (state service, helpers, mock data: read it first), `Down4More-Shared-Components-Spec.md` (tokens, `download-options`, `item-container`, `media-thumbnail`, `nav-buttons`), `Down4More-Per-Video-Options-Spec.md` (which options the panel offers for the selected rows).
> **Design source:** `Down4More___Batch_options.html` (light and dark). The behaviour below is the prototype's behaviour. Two places where the prototype is not followed are listed in section 8.
> **Backend:** only the Download button calls it (`startDownloads`). Apply is frontend state.

---

## 0. The page in one minute

Left: the videos chosen in step 1. Right: one options panel. With **nothing ticked the page is in Global mode**, so the panel applies to every video. Tick rows to apply to only those. **Apply** stamps the panel's settings on the target rows and their tag changes from "Default" to e.g. "1080p · mp4". **Download (N)** starts the downloads for the target rows.

---

## 1. Route and files

| | |
|---|---|
| Route | `/playlist/options` (guards: `hasFetchResultGuard`, `hasChosenGuard`) |
| Component | `PlaylistOptionsComponent`, selector `d4m-playlist-options`, standalone, OnPush |
| Files | `features/playlist/options/playlist-options.component.ts / .html / .scss` |
| State | `PlaylistStateService`: `chosenItems`, `selectedIds`, `isGlobal`, `draft`, `dirty`, `catalog`, `effectiveCatalog`, `summary`, `tagFor()`, `apply()`, `requests()` |
| Services | `DownloadService.start(requests)` (core, wraps `ApiService.startDownloads`), `Router` |

**Shared pieces used:** `d4m-page-container` (`size="lg"`, `padding="split"`, `layout="split"`), `d4m-item-container`, `d4m-media-thumbnail` (variant `option-select`), `d4m-download-options` (`layout="contents"`), `d4m-nav-buttons` (two instances, size `lg`). No new components.

---

## 2. Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [ Global ]      Global · 9 videos · 638 MB │  ( video+audio | audio only | video only )  │
│ ┃ [▶] Rocket landing…        File size │ Duration │  [ Quality ▾ ]   [ Format ▾ ]            │
│ ┃     ▢ Default              40 MB    │ 12:48    │  [ Caption ▾ │ Separate file ▾ ]        │
│ ┃ [▶] How tides actually…                          │  [ Bit-rate (kbps) ]  [   Apply   ]       │
│ ┃  ...5 rows visible...                            │                     Unsaved changes       │
│                                                    │  [ Download (9)  ↓ ]  (pinned to bottom)  │
└───────────────────────────────────────────────────────────────────────────┘
```

| Part | Spec |
|---|---|
| Card | `<d4m-page-container size="lg" padding="split" layout="split">`: max-width 1040, padding `32px 40px 36px`. `[main]` is the list (flex `1.12 1 380px`), `[side]` is the panel (flex `1 1 340px`), gap 36. The columns stack, list first, automatically below a viewport of about 900px (page-container rule). The compact layout (720px and narrower) is in 2.2 |
| Heading | a visually hidden `<h1>` "Download options" |
| List | `d4m-item-container` with `selectable`, `noSelectionMeansAll`, `selectAllLabel="Global"`, `visibleRows = 5`, `[summary]="state.summary()"`. The header button is the **Global** ghost button: pressed when nothing is ticked, clicking it clears the ticks. Summary examples: `Global · 9 videos · 638 MB`, `3 of 9 selected · 148 MB` |
| Row | `d4m-media-thumbnail variant="option-select"`: checkbox, thumb box, title, **tag** under the title (grey "Default" or red applied text), then two meta columns "File size" and "Duration" with a 1px divider. Look: shared spec 4.6.10 and 4.6.7. In Global mode the **checkbox is hidden** but the row is still clickable |
| Side panel | flex column, gap 16. A grid (below), then **Download** pinned to the bottom (`margin-top: auto`) |

### 2.1 Side panel grid

The shared `d4m-download-options` is used in `layout="contents"` mode so this page's grid places its panels by name (shared spec 6.4). Apply sits in the same row as bit-rate, exactly as in the prototype.

```
grid-template-columns: repeat(2, minmax(0, 1fr));  gap: 16px;
areas:  "mode    mode"
        "quality format"
        "captions captions"
        "bitrate apply"
```

| Cell | Content |
|---|---|
| `mode` | video+audio / audio only / video only pills (inside `download-options`) |
| `quality`, `format` | two selects in panels |
| `captions` | "Caption" and "Separate file" selects side by side in one panel |
| `bitrate` | "Bit-rate (kbps)" number input in a panel |
| `apply` | flex column, `justify-content: flex-end`, gap 6: the **Apply** button (size `lg`, amber, full width, 72 high), then the status line |
| Status line | 12 / 700, centred, height 16, `aria-live="polite"`. `dirty`: **"Unsaved changes"** in `--color-accent`. Otherwise **"Settings applied"** in `--color-text-muted` |
| Download | `d4m-nav-buttons` size `lg`, `fullWidth`, label `Download (N)` where N is the number of target rows, arrow-down icon 22 |

> Everything about the look of Apply, Download, panels, selects and pills is already in the shared spec (4.5 and 4.6). This page adds no new styles except the grid and the status line.

### 2.2 Compact layout (rev 3)

At 720px and narrower (shared spec 4.4): the list is **on top**, the options panel **under it**, in one column, like the compact Single page. **No design exists for it, so this is assumed.**

```
┌────────────────────────────┐
│ [ Global ]  Global · 9 videos · 638 MB │
│ ┃ [▶] Rocket landing, full…  │
│ ┃     40 MB · 12:48          │
│ ┃     ▢ Default              │
│ ┃  ...5 rows visible...      │
│                              │   gap 24
│ ( video+audio | audio only | │
│   video only )               │   pills wrap
│ [ Quality ▾ ]  [ Format ▾ ]  │
│ [ Caption ▾ │ Separate file ▾ ] │
│ [ Bit-rate ]   [   Apply   ] │
│              Unsaved changes │
│ [      Download (9)  ↓     ] │   full width, last
└────────────────────────────┘
```

| Part | Compact rule |
|---|---|
| Order | list (header + 5 rows), then the side panel: mode, quality + format, captions, bit-rate + Apply, Download. DOM order, so the Tab order does not change |
| Card | padding `24px 16px`, gap between list and panel 24 |
| List header | Global button and the summary. The summary drops under the button if it does not fit (shared 6.7) |
| Row | the compact row of shared 4.6.10: checkbox (still hidden in Global mode), thumb 84 x 56, title, then one meta line `40 MB · 12:48` instead of the two meta columns, then the tag. Height stays 82 |
| Side grid | **unchanged.** It is already 2 columns and was designed for about 340px, and it still fits at 296 to 326px (two panels of about 140 to 155px). The mode pills wrap inside their panel |
| Apply | stays in the bit-rate row, 72 high, with its status line under it |
| Download | full width, the last element on the page. The message (`role="alert"`) sits under it |
| `.opt` | `height: auto` (it only needs the list's height when the two columns sit side by side) |

---

## 3. Code

```ts
@Component({
  selector: 'd4m-playlist-options',
  imports: [PageContainerComponent, ItemContainerComponent, ItemTemplateDirective,
            MediaThumbnailComponent, DownloadOptionsComponent, NavButtonsComponent],
  templateUrl: './playlist-options.component.html',
  styleUrl: './playlist-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistOptionsComponent {
  protected readonly state = inject(PlaylistStateService);
  private readonly download = inject(DownloadService);
  private readonly router = inject(Router);

  protected readonly starting = signal(false);
  protected readonly message = signal<string | null>(null);   // under the Download button

  protected readonly applyButtons = [navApply()];
  protected readonly downloadButtons = computed<NavButton[]>(() => [
    { ...navDownload(), label: `Download (${this.state.targetItems().length})`, loading: this.starting() },
  ]);

  protected onPressed(id: string): void {
    if (id === 'apply') { this.message.set(null); this.state.apply(); }
    if (id === 'download') this.startDownload();
  }

  private startDownload(): void {
    if (this.state.dirty()) {                       // unsaved changes: do not guess
      this.message.set('Press Apply to save your changes first.');
      return;
    }
    this.message.set(null);
    this.starting.set(true);
    this.download.start(this.state.requests()).subscribe({
      next: () => this.router.navigate(['/downloads']),
      error: () => { this.starting.set(false); this.message.set("Couldn't start the downloads. Try again."); },
    });
  }
}
```

```html
<h1 class="visually-hidden">Download options</h1>

<d4m-page-container size="lg" padding="split" layout="split">
  <section main aria-label="Chosen videos">
    <d4m-item-container [items]="state.chosenItems()" [selectable]="true" [visibleRows]="5"
                        selectAllLabel="Global" [noSelectionMeansAll]="true"
                        [summary]="state.summary()" [(selectedIds)]="state.selectedIds">
      <ng-template d4mItem let-item let-sel="selected" let-toggle="toggle">
        <d4m-media-thumbnail variant="option-select" [item]="item"
                             [selected]="sel" (selectedChange)="toggle()"
                             [showCheckbox]="!state.isGlobal()"
                             [appliedTag]="state.tagFor(item.id)" />
      </ng-template>
    </d4m-item-container>
  </section>

  <section side class="opt" aria-label="Download settings">
    <div class="opt__grid">
      <d4m-download-options layout="contents" [(settings)]="state.draft" [catalog]="state.effectiveCatalog()" />
      <div class="opt__apply">
        <d4m-nav-buttons size="lg" [fullWidth]="true" [buttons]="applyButtons" (pressed)="onPressed($event)" />
        <p class="opt__status" [class.opt__status--dirty]="state.dirty()" aria-live="polite">
          {{ state.dirty() ? 'Unsaved changes' : 'Settings applied' }}
        </p>
      </div>
    </div>

    <d4m-nav-buttons class="opt__download" size="lg" [fullWidth]="true"
                     [buttons]="downloadButtons()" (pressed)="onPressed($event)" />
    @if (message()) { <p class="opt__message" role="alert">{{ message() }}</p> }
  </section>
</d4m-page-container>
```

```scss
// tokens only
.opt { display: flex; flex-direction: column; gap: 16px; min-width: 0; height: 100%; }
.opt__grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: stretch;
  grid-template-areas: "mode mode" "quality format" "captions captions" "bitrate apply";
}
.opt__apply { grid-area: apply; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; }
.opt__status { margin: 0; height: 16px; font-size: 12px; font-weight: 700; text-align: center;
               color: var(--color-text-muted); }
.opt__status--dirty { color: var(--color-accent); }
.opt__download { margin-top: auto; }
.opt__message { margin: 0; font-size: 13px; font-weight: 700; text-align: center; color: var(--color-danger); }
@include compact { .opt { height: auto; } }   // stacked under the list
```

---

## 4. Behaviour in detail

### 4.1 Selection and Global mode

| Situation | List | Panel | Download label |
|---|---|---|---|
| Nothing ticked (**Global**, the default) | Global button pressed, checkboxes hidden, summary "Global · N videos · size" | | `Download (N)`, N = all chosen |
| Click a row | that row is ticked and highlighted, Global button released, checkboxes appear | | `Download (k)` |
| Tick or untick more rows | summary "k of N selected · size" | | |
| Untick the last ticked row | back to Global | | `Download (N)` |
| Click **Global** while rows are ticked | clears every tick, back to Global | | |

The panel never changes because of selection. It always shows `draft`.

### 4.2 Apply

1. Press **Apply**: `state.apply()` stamps `draft` on every **target row** (the ticked rows, or all in Global).
2. Those rows' tags change from "Default" to the tag text (`settingsTag`, Flow spec section 5), for example `1080p · mp4`, `720p · mkv · video only`, `mp3 · 300k`.
3. The status line changes to "Settings applied".
4. Rows outside the target keep their old tag. Apply again later with other rows ticked to give them different settings.
5. No backend call.

### 4.3 Download

1. **Unsaved changes** (`dirty`): do not start. Show "Press Apply to save your changes first." under the button (`role="alert"`). The message goes away on the next Apply or Download press.
2. Otherwise: `DownloadService.start(state.requests())` with **one request per target row**, each with its own applied settings (or the defaults). Download button shows its spinner and ignores clicks while starting.
3. Success: navigate to `/downloads`.
4. Failure: stop the spinner and show "Couldn't start the downloads. Try again." The user's ticks and settings are untouched.

### 4.4 Options rules (come from the shared component)

**(rev 4)** The **lists** in the table come from `state.effectiveCatalog()`: with exactly one target row it is that video's own `catalog`, otherwise the main `FetchResult.catalog`. If a narrower video clamps the panel's quality or bit-rate, the choice stays clamped when that video is unticked. Apply and Download send the choice as picked; the per-video fallback is backend work (`Down4More-Per-Video-Options-Spec.md`).

These live in `applyOptionRules` and `d4m-download-options` (shared spec 6.4). The page does nothing special:

| Mode | Quality | Format list | Bit-rate | Captions |
|---|---|---|---|---|
| video+audio | enabled | mp4, mkv, webm | enabled | enabled |
| audio only | dimmed, value null | mp3, m4a, opus, wav | enabled | enabled, "Separate file" forced on |
| video only | enabled | mp4, mkv, webm | dimmed, value null | enabled |

Switching mode resets the format to the first valid one (video: mp4, audio: mp3). Disabled fields stay visible so the layout never jumps.

### 4.5 Back

There is no Back button in the prototype. The user returns to step 1 with the browser back button or by the nav bar. If you want a visible one, add `navBack()` to a `[footer]` slot (`['/playlist','select']`). The state service keeps every tick and every applied setting.

---

## 5. States

| State | What the user sees |
|---|---|
| Default | Global, all rows "Default", panel on defaults (video+audio, 1080p, mp4, captions off, 300 kbps), "Settings applied", `Download (N)` |
| Panel edited | "Unsaved changes" in red under Apply |
| Applied | target rows show the red tag, status "Settings applied" |
| Some rows ticked | highlighted rows, `k of N selected` |
| Audio only / video only | quality or bit-rate dimmed (rules table above) |
| Starting downloads | Download button spinner, clicks ignored |
| Start failed / unsaved | message under Download |
| Size unknown for a row | row shows `—`, summary leaves the size out if none are known |
| Few videos (1 to 4) | list keeps the height of 5 rows (`heightMode="fixed"`) so the panel does not jump |
| 300 videos | virtual scroll stays smooth |
| Compact layout (720px and narrower) | list on top, options panel under it, compact rows, Download last and full width. Section 2.2 |
| Refresh | the guards redirect (Home, or Select if only the choice was lost) |

---

## 6. Accessibility

- Visually hidden `<h1>`. The two sections have `aria-label`.
- Rows are `<button aria-pressed>`, Global is a ghost button with `aria-pressed`, all with the visible focus ring (4.7).
- The status line and the list summary are `aria-live="polite"`. The Download message is `role="alert"`.
- Disabled fields are real `disabled` controls (dimmed, not hidden).
- Never colour alone: the red tag has text, "Unsaved changes" is text.
- Tab order: Global, rows, mode pills, quality, format, caption, separate file, bit-rate, Apply, Download.

---

## 7. Done when

- [ ] Opens in Global mode with all chosen videos listed, checkboxes hidden, `Download (N)` correct.
- [ ] Clicking rows leaves Global, ticks rows, shows checkboxes, and updates summary and Download count. Unticking the last row, or pressing Global, returns to Global.
- [ ] Apply stamps only the target rows and the tags read `1080p · mp4`, `... · video only`, `mp3 · 300k` for the three modes.
- [ ] "Unsaved changes" appears on any panel edit and goes after Apply. Download is blocked with the message while it shows.
- [ ] Mode changes follow the rules table and never produce an invalid combination.
- [ ] Download sends one request per target row with the right settings, then goes to `/downloads`. A failure keeps the page as it was.
- [ ] Back to Select and forward again keeps ticks and applied tags.
- [ ] Layout matches the prototype in light and dark.
- [ ] Compact layout (390px wide, light and dark): the list on top and the options panel under it, rows show `40 MB · 12:48` under the title, the side grid still has 2 columns, Download is last and full width, no horizontal scroll.
- [ ] Passes the checklist in section 9 of the shared spec.

---

## 8. Where this differs from the prototype and the shared spec

1. **Captions** stay enabled in every mode. The prototype greyed them for audio and video-only. The shared spec already calls that an accident (6.4, "Captions rule (final)").
2. **Download with unsaved changes** is blocked here. The prototype just set a "queued" flag and did nothing with the panel.
3. **Row click** toggles selection (the prototype's behaviour). The shared spec's `activate` flow (row opens its own settings) is not used. The change to `media-thumbnail` (new `showCheckbox` input) is listed in Flow spec section 7.
4. The prototype's fixed `mbs` text becomes `formatSize` ("40 MB") and its hard-coded list becomes the mock data in Flow spec section 6.

## 9. Choices you can change

1. After Download the user goes to `/downloads`.
2. Download is blocked when there are unsaved changes (alternative: download with the last applied settings and keep the warning).
3. Selecting a row does not load that row's settings into the panel (alternative: load them when exactly one row is ticked).
4. No visible Back button on this page.
5. **(rev 4)** One video: its own options. Several: the main catalog, with the clamp staying put and no hint text (`Down4More-Per-Video-Options-Spec.md`, section 6).
