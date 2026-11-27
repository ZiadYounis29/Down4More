# Down4More: Single Page Style Notes (Trim panel)

> **Scope:** the look of `d4m-trim-video` (`features/single/components/trim-video/`). Companion to `Down4More-Single-Page-Spec.md` section 5.3 (behaviour), which points here for "values".
> **(rev 5)** First written for this project; the original file was lost.
> **Source:** the *Download options* boards, **Light · Trim expanded** and **Dark · Trim expanded**. Every number below was read from those boards' CSS and **measured in a browser** (section 8), not guessed.
> **Rule for this file:** the boards' own page container (`.box`, `.c`) is **not** copied. The Trim panel is built on the **shared containers** (`d4m-page-container`, `d4m-panel`, tokens from `Down4More-Shared-Components-Spec.md` section 4). Only the Trim-specific dimensions come from the boards.

---

## 1. What is shared and what is Trim-only

| Piece | Comes from | Value |
|---|---|---|
| Page card | `d4m-page-container size="lg" padding="split"` (shared 6.1) | 1040 wide, padding `32px 40px 36px`, radius 28, fill `--color-surface`. The boards' `.box` (padding `36px 44px`) is **not** used |
| Panel shell | `d4m-toggle-panel` on `d4m-panel` (Single 5.1, shared 4.6.2) | radius 18, fill `--color-bg`, no border. The boards' `.c` 1px border is **not** copied |
| Trim panel padding | Single spec section 4 | `20px 24px` (instead of the panel's `14px 16px`) |
| Switch | `d4m-toggle` (shared 4.6.5) | track 46 x 26 |
| Segment fields | the select/input look (shared 4.6.3) | height 42, radius 12, text 15/600, `--field-border`, `--field-bg` |
| Labels | `.lab` (shared 4.6.13) | 13/700 `--color-text-muted`, left-aligned inside the Trim panel |
| Segment box, rail, add button, preview, timeline | **this file** | sections 2 to 5 |

Trim spans the **full width** of the grid when open (Single spec rule 2), so the panel is as wide as the page card's content: **958px** (1040 - 2 x 40 padding - 2 x 1px card border).

---

## 2. Panel layout

```
┌ d4m-panel (padding 20px 24px, radius 18) ───────────────────────────────────┐
│ ┌ left, 330 ───────────────┐  gap 24  ┌ right, 1fr ──────────────────────┐ │
│ │ header: label + switch   │          │ preview (flex 1, min-h 200)      │ │
│ │ gap 14                   │          │ gap 14                           │ │
│ │ segment box (flex 1)     │          │ timeline row (height 16)         │ │
│ └──────────────────────────┘          └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Element | Dimensions |
|---|---|
| Panel | `display: grid; grid-template-columns: 330px 1fr; gap: 24px; align-items: stretch; padding: 20px 24px; border-radius: 18px` |
| Left column (`.tl`) | 330 wide, flex column, gap 14, `min-width: 0` |
| Header row | flex, `align-items: center`, gap 14. Label, then the switch showing "On". Height 26 |
| Right column (`.rt`) | 1fr, flex column, gap 14, `min-width: 0` |
| Both columns | the same height (grid stretch). With 3 segment fields it is **266px**, so the whole panel is **306px** tall |

---

## 3. Segment box (left column)

| Element | Dimensions and look |
|---|---|
| Segment box | `flex: 1`, flex row, gap 14, padding 14, radius **14**, border `1px solid --color-border`, **transparent** fill. With 3 fields: 330 x 226 |
| Rail | width **2**, `margin: 4px 6px 4px 2px`, `flex: none`, stretches the full height of the list (188 with 3 fields). Colour: `--trim-rail` |
| Rail dot | 12 x 12 circle, `position: absolute; top: 0; left: -5px`, fill `--color-primary` (both themes). Marks the selected segment |
| Field list (`.sl`) | `flex: 1`, flex column, gap **10**, `min-width: 0`. With the box padding and the rail this leaves **276** for the fields |
| Segment field | the shared field look: height **42**, radius 12, padding `0 14px`, text 15/600. First field reads **"All segments"**, then "Segment 2", "Segment 3", ... Each shows `HH:MM:SS to HH:MM:SS` once it has a range |
| Add button | **40 x 40** circle, `margin-top: auto; align-self: flex-end` (bottom right of the list), plus icon **18**. Look: `--trim-add-*` (section 6) |
| Remove (x) | small x at the right inside a field, only when there is more than one segment (Single 5.3). Not in the boards: icon 14, `--color-text-muted`, hit area 24 x 24 *(assumed)* |

Height of the list with 3 fields and the button: 3 x 42 + 40 + 3 x 10 = **196**.

---

## 4. Preview (right column, top)

| | |
|---|---|
| Size | `flex: 1`, **min-height 200**, full column width. With 3 segment fields it grows to **236** |
| Radius | **14** (not 12: it is not a `d4m-thumb-box`) |
| Content | play icon **44** centred |
| Look | fill `--box-bg`, icon `--trim-preview-fg`, border `--trim-preview-border` |

This is **not** `d4m-thumb-box`: that component's `preview` size is `flex` with min-height 120 and radius 12 (Downloads details), and Trim needs 200 and 14. Trim draws its own preview box inside `trim-video` (same play icon from `d4m-icon`). Do not change `d4m-thumb-box` for it.

---

## 5. Timeline (right column, bottom)

| Element | Dimensions and look |
|---|---|
| Row (`.tm`) | flex, `align-items: center`, gap **14**, height **16** |
| Time labels | `.lab` style, 13/700 `--color-text-muted`, format `HH:MM:SS`. Left label = start, right label = end |
| Track area (`.tk`) | `flex: 1`, `position: relative`, height **16** |
| Track line | `::before`, `left: 0; right: 0; top: 7px; height: 2px`. Colour `--trim-track` |
| Knobs | **14 x 14** circles, `position: absolute; top: 1px`. Start knob `left: 0`, end knob `right: 0` (positions then follow the values). Fill `--color-primary` in both themes |

Keyboard: each knob is focusable (arrow keys move it, Single 5.3) and shows the standard focus ring `2px solid --color-accent`, offset 2 (shared 4.7).

---

## 6. Colours per theme

Everything uses shared tokens except the seven **new Trim tokens**, which are added to `styles.scss` next to the other component tokens (shared 4.3). Components never read the theme.

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel fill | `--color-bg` | `#FDF0F0` | `#111418` |
| Segment box border | `--color-border` | `#F0D3D6` | `#43484E` |
| Segment fields | `--field-border` / `--field-bg` | `2px solid #7A1F3D` / transparent | `1px solid #43484E` / `#1A1F26` |
| Rail dot, knobs, "On" switch | `--color-primary` | `#7A1F3D` | `#5EC8FF` |
| Preview fill | `--box-bg` | transparent | `#1A1F26` |
| **Rail** | `--trim-rail` | `#7A1F3D` | `#43484E` |
| **Track line** | `--trim-track` | `#7A1F3D` | `#43484E` |
| **Add button** fill | `--trim-add-bg` | transparent | `#1A1F26` |
| **Add button** border | `--trim-add-border` | `2px solid #7A1F3D` | `2px solid #43484E` |
| **Add button** icon | `--trim-add-fg` | `#7A1F3D` | `#E6EAF0` |
| **Preview icon** | `--trim-preview-fg` | `#7A1F3D` | `#9AA5B4` |
| **Preview border** | `--trim-preview-border` | `2px solid #7A1F3D` | `none` |

---

## 7. SCSS

```scss
// styles.scss, inside the theme blocks
:root, :root[data-theme="light"] {
  --trim-rail: #7A1F3D;  --trim-track: #7A1F3D;
  --trim-add-bg: transparent;  --trim-add-border: 2px solid #7A1F3D;  --trim-add-fg: #7A1F3D;
  --trim-preview-border: 2px solid #7A1F3D;  --trim-preview-fg: #7A1F3D;
}
:root[data-theme="dark"] {
  --trim-rail: #43484E;  --trim-track: #43484E;
  --trim-add-bg: #1A1F26;  --trim-add-border: 2px solid #43484E;  --trim-add-fg: #E6EAF0;
  --trim-preview-border: none;  --trim-preview-fg: #9AA5B4;
}
```

```scss
// trim-video.component.scss  (the panel shell, header and switch come from d4m-toggle-panel)
@use 'styles/breakpoints' as *;

:host { display: block; }

.trim {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 24px;
  align-items: stretch;
  padding: 20px 24px;            // overrides the d4m-panel default 14px 16px
}
.left  { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.right { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

.segments {
  flex: 1; display: flex; gap: 14px; padding: 14px;
  border: 1px solid var(--color-border); border-radius: 14px;
}
.rail { position: relative; flex: none; width: 2px; margin: 4px 6px 4px 2px; background: var(--trim-rail); }
.rail-dot { position: absolute; top: 0; left: -5px; width: 12px; height: 12px; border-radius: 50%; background: var(--color-primary); }
.list { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.add {
  margin-top: auto; align-self: flex-end; width: 40px; height: 40px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
  background: var(--trim-add-bg); border: var(--trim-add-border); color: var(--trim-add-fg);
}

.preview {                       // Trim's own box, not d4m-thumb-box
  flex: 1; min-height: 200px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: var(--box-bg); color: var(--trim-preview-fg); border: var(--trim-preview-border);
}

.timeline { display: flex; align-items: center; gap: 14px; }
.track { position: relative; flex: 1; height: 16px; }
.track::before { content: ""; position: absolute; left: 0; right: 0; top: 7px; height: 2px; background: var(--trim-track); }
.knob { position: absolute; top: 1px; width: 14px; height: 14px; border-radius: 50%; background: var(--color-primary); }
.knob.start { left: 0; }  .knob.end { right: 0; }

@include compact {               // 720px and narrower
  .trim { grid-template-columns: 1fr; }   // segment box first, then preview and timeline
}
```


---

## 8. Measured sizes (check against these in review)

Measured from the boards at a 1200 x 1000 viewport, Trim expanded, 3 segment fields:

| Element | Width x height |
|---|---|
| Panel (boards, with their own container) | 950 x 306 (dark) / 308 (light, the extra 2 is the mock's 1px panel border, not copied) |
| Left column | 330 x 266 |
| Header row | 330 x 26 |
| Segment box | 330 x 226 |
| Rail | 2 x 188 |
| Rail dot | 12 x 12 |
| Field list | 276 x 196 |
| Segment field | 276 x 42 |
| Add button | 40 x 40 |
| Right column | 1fr x 266 |
| Preview | 1fr x 236 (min 200) |
| Timeline row / track | 1fr x 16 |
| Knob | 14 x 14 |
| Switch track | 46 x 26 |

In the app (shared page card, 958 content width) the right column is **556** wide instead of 546 to 548, because the shared card padding is `40px` where the board's was `44px`. Heights are the same.

---

## 9. Compact layout (720px and narrower)

No board exists, so this follows Single spec 5.3 and stays minimal *(assumed)*:

- the two columns stack: **segment box first**, then preview and timeline;
- the panel padding stays `20px 24px`, but the page card is already narrow (`24px 16px`), so use `20px 16px` here;
- the left column is `1fr` (no fixed 330);
- preview min-height stays 200, timeline unchanged, add button stays 40 x 40 (touch target).

---

## 10. States

| State | Rule |
|---|---|
| Trim off | collapsed `d4m-toggle-panel`: label left, switch "Off" right. None of the above is rendered |
| Disabled (`durationSec` is `null`) | switch disabled, panel dimmed .38, tooltip "Duration unknown" |
| Selected segment | the rail dot sits at that field; the timeline edits that segment |
| Invalid segment (start not before end) | field border `--color-danger`; Download disabled (Single 6) |
| Knob hover / dragging | cursor `grab` / `grabbing`; while dragging the knob uses `--color-accent` |
| Focus | `outline: 2px solid var(--color-accent); outline-offset: 2px` |

Hover and dragging colours are not in the boards *(assumed, same pattern as the scroll rail, shared 4.6.11)*.

---

## 11. Things this file corrects

| Where | Was | Now (from the boards) |
|---|---|---|
| P1 to P5 instructions (the "assumed values" for the Trim prompt) | preview min-height **180** | **200** |
| same | knob **22px** circle | **14px** circle (the 12px dot is the rail marker) |
| same | track **4px** | **2px** |
| same | segment fields "select look" only | plus the segment box (radius 14, 1px border, padding 14, gap 14), rail, and a 40 x 40 add button |
| Shared 4.6.5 (switch) | on-position `left: 22` in both themes | dark is `left: 21` (knob 20 at 3px, so the right gap stays 3). Light is `22`. **Fixed in the shared spec (rev 5)** |
| P3 T6 prompt | "preview ... using d4m-thumb-box size preview" | Trim's preview is its own element (section 4) |
| Shared 4.5 row 10 (Add segment) | transparent fill, 2px primary border, in both themes | light only. Dark uses `--trim-add-*` (section 6). **Row updated (rev 5)** |

**Done in rev 5:** the P1 to P5 instruction files (setup step 1 and 3, and the P3 T6 prompt and Attach line), the Single spec (header and 5.3), the Shared spec (4.5 row 10, 4.6.5) and the Project Tree now point at this file.
