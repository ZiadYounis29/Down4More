# Down4More: Single Page Spec

> **Scope:** `src/app/features/single/`. Companion to `Down4More-Shared-Components-Spec.md` (tokens, buttons, `d4m-page-container`, `d4m-media-thumbnail`, `d4m-download-options`, `d4m-nav-buttons`, primitives), `Down4More-Home-Page-Spec.md` (how the user arrives here) and `Down4More-Single-Page-Style-Notes.md` (Trim panel values).
> **Design source:** the Download options boards (desktop, light + dark) and the SVG: 3 desktop variants plus the **compact layout** (the SVG calls it the Android layout).
> **Not in this spec yet:** the contents of the **Frame Size** options. The page is built so that adding them later changes **nothing** in the layout (see section 4).
> **(rev 5)** The Trim panel's exact look (sizes, colours per theme, SCSS) is now written down in `Down4More-Single-Page-Style-Notes.md`, taken from the Trim expanded boards. Section 5.3 keeps the behaviour, the Style Notes keep the values.
> **(rev 4)** The catalog is the video's own (`item.catalog`) when it has one, else `FetchResult.catalog` (`Down4More-Per-Video-Options-Spec.md` 2.4).

---

## 0. The idea in one minute

- The Single page is **one grid of blocks**. Each block has a name. The page only decides **where each name goes**.
- There are **10 blocks**: `info`, `name`, `captions`, `mode`, `quality`, `format`, `bitrate`, `framesize`, `trim`, `download`.
- There are **2 layouts**: **desktop** (4 columns) and **compact** (2 columns, blocks stacked on top of each other).
- Two blocks can **expand** when switched on: `framesize` and `trim`. That is the only thing that changes the placement, and it is 3 simple rules (section 3).
- Almost everything is a **shared element**. Single only adds 3 small blocks of its own.

---

## 1. Route, files, data

| | |
|---|---|
| Route | `/single`, lazy `loadComponent` |
| Arrives from | Home, with exactly one video link |
| Data in | `FetchInfoService.lastResult()` (a `FetchResult` with `kind: 'single'`, `items[0]`, `catalog`). If it is `null` or the kind is not `single`, redirect to `/` |
| Data out | `ApiService.startDownloads([request])` (an array of 1), then navigate to `/downloads` |

```
features/single/
├─ single.component.ts / .html / .scss        (smart: state, grid, download handler)
└─ components/
   ├─ file-name/        d4m-file-name         (panel: label + input with .ext suffix)
   ├─ toggle-panel/     d4m-toggle-panel      (panel: label + switch, expands to show content)
   ├─ frame-size/       d4m-frame-size        (a toggle-panel; options come later)
   └─ trim-video/       d4m-trim-video        (a toggle-panel with the segments, preview, timeline)
```

**Shared elements used (nothing is rebuilt here):**

| Block | Element | Notes |
|---|---|---|
| `info` | `d4m-media-thumbnail variant="single"` | 150 x 100 box, channel, file size, duration, "Video: [name]" (shared spec 6.5) |
| `captions`, `mode`, `quality`, `format`, `bitrate` | `d4m-download-options layout="contents"` | one wrapper, five panels (shared spec 6.4) |
| `download` | `d4m-nav-buttons size="lg"` with `navDownload()` | 72px button (shared spec 6.3, 4.5 row 1) |
| all panels | `d4m-panel`, `d4m-toggle`, `d4m-select`, `d4m-segmented-control`, `d4m-tag`... | shared primitives |
| card | `d4m-page-container size="lg" padding="split"` | 1040 wide, `32px 40px 36px` |

---

## 2. The blocks and the two layouts

### 2.1 Block names

| Name | What it is | Cell size when collapsed |
|---|---|---|
| `info` | thumbnail, channel, file size, duration, video name | half the width, 2 rows tall |
| `name` | file name field | half the width |
| `captions` | Caption select + Separate file select | half the width |
| `mode` | video+audio / audio only / video only | half the width |
| `quality` | quality select | one quarter |
| `format` | format select | one quarter |
| `bitrate` | bit-rate input | one quarter |
| `framesize` | "Frame Size" label + switch | one quarter |
| `trim` | "Trim Video" label + switch | one quarter |
| `download` | Download button | half the width, button aligned right |

### 2.2 Desktop (the default, wider than 720px)

A grid of **4 equal columns**, gap 16. The rows are as tall as their content (a normal one is about 96px).

```
┌──────────────────────┬──────────────────────┐
│ info                 │ name                 │
│ (thumb, channel,     ├──────────────────────┤
│  size, duration,     │ captions             │
│  video name)         │                      │
├───────────┬──────────┼──────────────────────┤
│ quality   │ format   │ mode                 │
├───────────┼──────────┼──────────────────────┤
│ framesize │ bitrate  │            [Download]│
├───────────┴──────────┴──────────────────────┤
│ trim                                        │
└─────────────────────────────────────────────┘
```

### 2.3 Compact layout (720px and narrower)

This is the layout of any narrow window: a resized browser, a tablet held upright, and the Android app. It depends on **width only**, there is no platform check (shared spec, 4.4). The SVG calls it the Android layout.

A grid of **2 equal columns**, gap 16. The blocks are **placed on top of each other** in this order, exactly as drawn in the SVG:

```
┌─────────────────────────┐
│ info                    │
├─────────────────────────┤
│ name                    │
├─────────────────────────┤
│ captions                │
├─────────────────────────┤
│ mode                    │
├────────────┬────────────┤
│ quality    │ format     │
├────────────┼────────────┤
│ framesize  │ bitrate    │
├────────────┼────────────┘
│ trim       │
└────────────┼────────────┐
             │ [Download] │
             └────────────┘
```

Rules: the pairs (quality / format, frame size / bit-rate) share a row. Trim is alone on the left. Download is alone on the right of the last row.

---

## 3. Where the blocks go: three rules

`framesize` and `trim` are **collapsed** by default (just a label and a switch). Switching one on **expands** it. The page keeps two booleans, `frameSizeOn` and `trimOn`. The placement follows these rules:

**Desktop**
1. **Frame Size on:** the `framesize` block grows to **two columns wide and as tall as its content**. `bitrate` moves one cell to the right (column 3), and `download` shrinks to the last column (column 4).
2. **Trim on:** the `trim` block becomes **full width** on its own row.
3. Frame Size's row and Trim's row are always **below** `quality`, `format` and `mode`. Trim is always the **last** row.

**Compact layout**
1. An expanded block takes the **full row**.
2. If the expanded block shared its row with another block, that block moves to the **row above, left cell**. With Frame Size on, **Bit-rate sits on top of the Frame Size panel**.
3. `download` is always the **last row, right cell**.

That is all. There is no other placement logic.

### 3.1 The four states, as grid areas

The page puts one CSS class on the grid (`fs-on`, `trim-on`, both or none) and each class sets `grid-template-areas`. A dot (`.`) is an empty cell.

**Desktop (4 columns)**

| Frame Size | Trim | `grid-template-areas` |
|---|---|---|
| off | off | `"info info name name"` `"info info captions captions"` `"quality format mode mode"` `"framesize bitrate download download"` `"trim . . ."` |
| **on** | off | `"info info name name"` `"info info captions captions"` `"quality format mode mode"` `"framesize framesize bitrate download"` `"trim . . ."` |
| off | **on** | `"info info name name"` `"info info captions captions"` `"quality format mode mode"` `"framesize bitrate download download"` `"trim trim trim trim"` |
| **on** | **on** | `"info info name name"` `"info info captions captions"` `"quality format mode mode"` `"framesize framesize bitrate download"` `"trim trim trim trim"` |

**Compact layout (2 columns)**

| Frame Size | Trim | `grid-template-areas` |
|---|---|---|
| off | off | `"info info"` `"name name"` `"captions captions"` `"mode mode"` `"quality format"` `"framesize bitrate"` `"trim ."` `". download"` |
| **on** | off | `"info info"` `"name name"` `"captions captions"` `"mode mode"` `"quality format"` `"bitrate ."` `"framesize framesize"` `"trim ."` `". download"` |
| off | **on** | `"info info"` `"name name"` `"captions captions"` `"mode mode"` `"quality format"` `"framesize bitrate"` `"trim trim"` `". download"` |
| **on** | **on** | `"info info"` `"name name"` `"captions captions"` `"mode mode"` `"quality format"` `"bitrate ."` `"framesize framesize"` `"trim trim"` `". download"` |

### 3.2 The code

```html
<!-- single.component.html -->
<d4m-page-container size="lg" padding="split">
  <div class="single" [class.fs-on]="frameSizeOn()" [class.trim-on]="trimOn()">
    <d4m-media-thumbnail class="a-info" variant="single" [item]="item()" />
    <d4m-file-name class="a-name" [(value)]="fileName" [extension]="settings().format" [fallback]="item().title" />

    <d4m-download-options layout="contents" [(settings)]="settings" [catalog]="catalog()" />
    <!-- the wrapper's five panels place themselves: captions, mode, quality, format, bitrate -->

    <d4m-frame-size class="a-framesize" [(open)]="frameSizeOn" />
    <d4m-trim-video class="a-trim" [(open)]="trimOn" [durationSec]="item().durationSec" [(segments)]="segments" />

    <d4m-nav-buttons class="a-download" size="lg" [buttons]="buttons()" (pressed)="onPressed($event)" />
  </div>
  @if (error()) { <p class="single__error" role="alert">{{ error() }}</p> }
</d4m-page-container>
```

```scss
// single.component.scss  (tokens only)
.single { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: stretch;
  grid-template-areas: "info info name name" "info info captions captions" "quality format mode mode"
                       "framesize bitrate download download" "trim . . .";
  &.fs-on   { grid-template-areas: "info info name name" "info info captions captions" "quality format mode mode"
                                   "framesize framesize bitrate download" "trim . . ."; }
  &.trim-on { grid-template-areas: "info info name name" "info info captions captions" "quality format mode mode"
                                   "framesize bitrate download download" "trim trim trim trim"; }
  &.fs-on.trim-on { grid-template-areas: "info info name name" "info info captions captions" "quality format mode mode"
                                          "framesize framesize bitrate download" "trim trim trim trim"; }
}
.a-info { grid-area: info; }  .a-name { grid-area: name; }  .a-framesize { grid-area: framesize; }
.a-trim { grid-area: trim; }  .a-download { grid-area: download; justify-self: end; align-self: center; }
.fs-on .a-framesize { align-self: start; }               // the expanded panel is as tall as its content
.fs-on .area-bitrate, .fs-on .a-download { align-self: start; }   // neighbours of the tall panel align to the top

@include compact {                                        // compact layout, 720px and narrower
  .single { grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas: "info info" "name name" "captions captions" "mode mode" "quality format"
                         "framesize bitrate" "trim ." ". download";
    &.fs-on   { grid-template-areas: "info info" "name name" "captions captions" "mode mode" "quality format"
                                     "bitrate ." "framesize framesize" "trim ." ". download"; }
    &.trim-on { grid-template-areas: "info info" "name name" "captions captions" "mode mode" "quality format"
                                     "framesize bitrate" "trim trim" ". download"; }
    &.fs-on.trim-on { grid-template-areas: "info info" "name name" "captions captions" "mode mode" "quality format"
                                           "bitrate ." "framesize framesize" "trim trim" ". download"; }
  }
  .a-download { justify-self: stretch; }                  // fills its right cell
}
```

The shared wrapper gives each of its five panels `grid-area: <field name>` **and** a class `area-<field name>` (for example `area-bitrate`) in `contents` mode (shared spec 6.4), so the names above match with no extra code and the page can style a panel by class.

**Tab order** follows the DOM: info, file name, captions, mode, quality, format, bit-rate, frame size, trim, Download. In the compact layout, with everything collapsed, frame size and bit-rate are swapped compared with the screen order. This is accepted to keep the code simple (with Frame Size on, the order matches the screen).

---

## 4. Frame Size: built to expand later

The Frame Size **options are not designed yet**, so for now the block is only the collapsed switch panel plus an empty expanded area. The layout already supports the expanded state, so adding the options later means filling **one slot** and changing nothing else.

| Now | Later |
|---|---|
| `d4m-frame-size` = `d4m-toggle-panel` with label "Frame Size". Switching on sets `frameSizeOn = true`, the grid changes by rule 1, and the panel shows a plain placeholder box (min-height 200, dashed `--color-border`, text "Frame size options go here") | replace the placeholder with the real options inside `d4m-frame-size`. No change in `single.component` or its grid |

**Expand behaviour (the same for Frame Size and Trim, from the designs):**
- Collapsed: a `d4m-panel` with the label on the left and the switch on the right (`flex`, `justify-content: space-between`, `align-items: center`). Label 13/700 muted. Switch "Off".
- Expanded: the panel stacks. **Header row** with the label and the switch side by side (gap 14, switch shows "On"), then the content below with gap 14. The panel keeps the same fill, radius and padding (`d4m-panel`, 4.6.2). Padding for the Trim panel is `20px 24px`.
- No animation needed. If one is added later: height and opacity only, 150ms.

**What the SVG already tells us about the content** (to be specified in the Frame Size spec; ignore for now):

| Part | From the SVG |
|---|---|
| Preview | a small box showing the picture in the chosen frame |
| Fill type | 3 pills: Crop, Blur (the SVG spells it "Blurr"), Black |
| Aspect ratio | pills: Original, 16:9, 21:9, 4:5, 9:16, 1:1, 4:3, and **Custom** with two number boxes `w : h` |
| Size | tall panel: header, then the preview and fill type side by side, then the aspect-ratio pills in two rows |

**Provisional data shape** (so `SingleExtras` compiles now; replaced by the Frame Size spec):

```ts
export interface FrameSizeSettings {
  fill: 'crop' | 'blur' | 'black';
  aspect: 'original' | '16:9' | '21:9' | '4:5' | '9:16' | '1:1' | '4:3' | 'custom';
  customW?: number;
  customH?: number;
}
```

---

## 5. The three blocks that are Single-only

### 5.1 `d4m-toggle-panel` (the expanding panel)

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` (required) | | "Frame Size", "Trim Video" |
| `open` | `model<boolean>` | `false` | `[(open)]` |
| `disabled` | `boolean` | `false` | switch disabled, panel dimmed (.38) |

Slot: `[expanded]` (shown only when `open` is true). The switch is `d4m-toggle` with `aria-expanded` on the switch's control. The panel is a `d4m-panel`. Frame Size and Trim are both built on this one component.

### 5.2 `d4m-file-name`

| Inputs | Type | Notes |
|---|---|---|
| `value` | `model<string>` | the name **without** the extension |
| `extension` | `string` | shown as a muted, non-editable suffix inside the field, like the design's "[Name].mp4" |
| `fallback` | `string` | used when the field is empty (the video title) |

Look: a `d4m-panel` with the label "File name" (13/700 muted) over a text input (4.6.3). The suffix sits at the right inside the field in `--color-text-muted`.
Rules: the default value is the video title with these characters removed: `\ / : * ? " < > |`, trimmed, at most 150 characters. If the user clears it, the fallback is used when the download starts. The extension always equals the current format, so changing the format updates the suffix and never the typed name. The final name is `name + '.' + format`.

### 5.3 `d4m-trim-video`

Built on `d4m-toggle-panel` (label "Trim Video"). Collapsed it is the quarter cell. Expanded it is full width (rule 2).

| Inputs | Type | Notes |
|---|---|---|
| `open` | `model<boolean>` | |
| `durationSec` | `number \| null` | `null` (live or unknown): the switch is disabled with the tooltip "Duration unknown" |
| `segments` | `model<TrimSegment[]>` | the cut segments, in seconds |

Look (**all values in `Down4More-Single-Page-Style-Notes.md`**, which wins if the two ever differ): two columns `330px 1fr`, gap 24, panel padding `20px 24px`. **Left:** a segment box with a vertical rail and the list of segment fields ("All segments", "Segment 2", "Segment 3", ...) and a circular add button (`+`) at the bottom right. **Right:** a preview box (placeholder with a play icon, Trim's own element and not `d4m-thumb-box`) and under it the timeline: time label, a track with two round knobs, time label. In the compact layout the two columns stack: segment box first, then preview and timeline.

Behaviour (simple rules, assumed from the design):
- When trim is on and there are no segments, the list shows one field, **"All segments"**, which means the whole video. The timeline knobs are at the two ends and the labels show `00:00:00` and the video duration.
- Dragging a knob (or using the arrow keys on it) sets the start or end of the selected segment. A knob can never cross the other. The labels show `HH:MM:SS`.
- The add button adds a new segment field. Each field shows its range as `HH:MM:SS to HH:MM:SS`. The selected field is the one the timeline edits.
- A field can be removed with a small x once there is more than one.
- Turning trim off keeps the segments in memory, but they are **not** sent.

```ts
export interface TrimSegment { startSec: number; endSec: number; }
```

---

## 6. State and the Download handler

```ts
export class SingleComponent {
  private fetchInfo = inject(FetchInfoService);
  private download = inject(DownloadService);
  private router = inject(Router);

  private result = computed(() => this.fetchInfo.lastResult());
  protected item = computed(() => this.result()!.items[0]);
  protected catalog = computed(() => this.item().catalog ?? this.result()!.catalog);   // (rev 4) own options, else the fetch catalog

  protected settings = signal<DownloadSettings>(defaultDownloadSettings(this.catalog()));
  protected fileName = signal(sanitizeName(this.item().title));
  protected frameSizeOn = signal(false);
  protected trimOn = signal(false);
  protected segments = signal<TrimSegment[]>([]);
  protected starting = signal(false);
  protected error = signal<string | null>(null);

  protected buttons = computed(() => [{ ...navDownload(), loading: this.starting(), disabled: !this.canDownload() }]);
  private canDownload = computed(() => !this.trimOn() || this.segments().every(s => s.startSec < s.endSec));

  protected onPressed(id: string) {
    if (id !== 'download') return;
    this.starting.set(true); this.error.set(null);
    this.download.start([this.buildRequest()]).subscribe({            // an array of 1
      next: () => this.router.navigate(['/downloads']),
      error: () => { this.starting.set(false); this.error.set("Couldn't start the download. Try again."); },
    });
  }

  private buildRequest(): DownloadRequest {
    const s = this.settings();
    return {
      item: this.item(),
      settings: s,
      extras: {
        fileName: (this.fileName().trim() || sanitizeName(this.item().title)) + '.' + s.format,
        trim: this.trimOn() && this.segments().length ? this.segments() : null,
        frameSize: null,                     // filled in when the Frame Size options exist
      },
    };
  }
}
```

`SingleExtras` (the stub in the shared spec, section 3) is now:

```ts
export interface SingleExtras {
  fileName: string;                        // full name with extension
  trim?: TrimSegment[] | null;             // null = the whole video
  frameSize?: FrameSizeSettings | null;    // null = original frame
}
```

**Helpers this page uses:**
- `defaultDownloadSettings(catalog)` is defined in the shared spec (section 3).
- `DownloadService.start(requests)` is a thin wrapper over `ApiService.startDownloads(requests)`. It is specified in the Core spec (feature services); the page only needs this one method.
- `sanitizeName(text)` is a pure function in `core/utils/sanitize-name.ts`: removes `\ / : * ? " < > |`, collapses spaces, trims, cuts to 150 characters, and returns an empty string if nothing is left. It has unit tests (empty, only illegal characters, 200 characters, spaces).

**⚙ Backend later:** nothing on this page changes. `startDownloads` and `fetchInfo` are the only calls, both behind `ApiService`. A live file-size estimate (the "40 mbs" in `info`) would update `item().sizeBytes`, and `d4m-media-thumbnail` re-renders (shared spec 6.5).

---

## 7. States

| State | What happens |
|---|---|
| No fetch result | redirect to `/` |
| Default | everything collapsed, desktop layout A |
| Audio-only / video-only | handled by `d4m-download-options` (quality or bit-rate dimmed, format list changes) |
| Frame Size on / Trim on / both | grid class changes, section 3 |
| Starting | the Download button shows its spinner and ignores clicks |
| Start failed | red message under the grid ("Couldn't start the download. Try again."), button works again |
| Trim has an invalid segment | Download disabled |
| Long title | the `info` block clamps it to 2 lines (shared spec 6.5), the file name field scrolls inside itself |
| No thumbnail / unknown duration | neutral placeholder, `—`. Trim switch disabled when the duration is unknown |
| Width 720px or less | compact layout |

---

## 8. Accessibility

- Every panel's control has a visible label. The file name input has `<label for>`.
- The switches are `role="switch"` with `aria-checked` and `aria-expanded` for the two expanding panels.
- The Download button is the only primary action. It has an `aria-label` that includes the file name only if the text is not clear from the label (it is clear, so none is needed).
- Errors use `role="alert"`.
- Both themes: every colour comes from tokens (shared spec, section 4), so light and dark need no extra code.

---

## 9. Playground (`/dev`)

`d4m-toggle-panel`: collapsed, expanded, disabled. `d4m-file-name`: default, long name, empty. `d4m-trim-video`: collapsed, "All segments", 3 segments, unknown duration. The whole Single grid in **8 states**: 4 desktop (Frame Size x Trim) and the same 4 at 390px wide, each in light and dark.

---

## 10. Done when

- [ ] The page uses only shared elements plus the 4 components in section 1.
- [ ] The 4 desktop states and the 4 compact states match the areas in section 3.1 and the SVG.
- [ ] Switching Frame Size or Trim on and off only changes a class on the grid.
- [ ] Compact layout: blocks are on top of each other in the order of section 2.3, Download is bottom right.
- [ ] Changing the format changes the file name suffix and not the typed name.
- [ ] The request sent has an array of 1, the right extension, and `trim` only when trim is on.
- [ ] Filling the Frame Size placeholder later needs no change outside `d4m-frame-size`.
- [ ] Looks right in light and dark and passes the checklist in section 9 of the shared spec.

---

## 11. Choices I made that you can change

1. Desktop uses a **4-column** grid so the quarter cells (quality, format, bit-rate, frame size, trim) line up exactly like the designs.
2. When Frame Size is on, **Download shrinks to one column** next to Bit-rate, as in the SVG.
3. The compact expanded states follow the sketch you approved: an expanded block takes the full row, and Bit-rate moves **above** the Frame Size panel. The SVG itself still shows only the collapsed compact layout, so update the SVG to match when convenient.
4. The Trim behaviour (All segments, add, knobs) is **my reading of the design**, since only the picture exists.
5. The file name field edits the **name only**, with the extension as a muted suffix, which looks the same as the design's "[Name].mp4".
6. The compact breakpoint is **720px**, the single breakpoint of the whole app (`@include compact`, shared spec 4.4).
