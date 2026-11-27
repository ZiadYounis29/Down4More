# Down4More: Home (Fetch) Page Spec

> **Scope:** `src/app/features/home/` plus the one core helper it needs (`url-parser`). Companion to `Down4More-Shared-Components-Spec.md` (tokens in section 4, buttons in 4.5, `d4m-logo`, `d4m-page-container`, `d4m-nav-buttons`) and `Down4More-Core-Shell-Spec.md` (nav bar and shell).
> **Backend:** not ready. Everything uses `ApiService.fetchInfo()` through the mock.
> **Design source:** `Down4More-light.html`. Where this spec changes the design, it says so.

---

## 0. The behaviour in one minute

1. The page starts with **one input bar** (plus button, text box, Fetch button) and **no URL boxes below it**.
2. The user pastes a link and presses **+** (or Enter). The link **moves down into the list below** the bar. The input clears and is ready for the next link.
3. Each added link becomes one row in the list. The list grows **downwards**.
4. Pressing **Fetch** loads info for every link in the list (plus whatever is still typed in the bar).
5. **The link decides where the user lands:**
   - exactly **one** link that is a **video** goes to the **Single** page
   - exactly **one** link that is a **playlist** goes to the playlist **Select** page
   - **two or more** links go to the playlist **Select** page as one batch

---

## 1. Route and files

| | |
|---|---|
| Route | `''` (the home route), lazy `loadComponent` |
| Folder | `features/home/` |

```
features/home/
├─ home.component.ts / .html / .scss          (smart: owns the state, calls services, navigates)
├─ home.routes.ts                              (optional, one route)
└─ components/
   ├─ url-bar/        d4m-url-bar              (dumb: plus, input, Fetch, inline error)
   └─ url-list/       d4m-url-list             (dumb: the rows, count, Clear all)
core/
├─ utils/parse-url.ts                          (pure function, unit-tested)
├─ services/url-parser.service.ts              (thin wrapper around parse-url, injectable)
├─ services/fetch-info.service.ts              (calls ApiService.fetchInfo, keeps the last result)
└─ models/fetch-result.model.ts                (see section 8)
```

`url-bar` and `url-list` are home-only, so they live under `features/home/components/`, not in `shared`. They follow the same rules as shared components (dumb, OnPush, signals, `d4m-` prefix, tokens only).

**Shared pieces used:** `d4m-page-container` (size `md`, padding `default`), `d4m-logo` (wordmark in the title), `d4m-nav-buttons` (the Fetch button, `navFetch()`, size `md`). The plus button, the row remove button and the Clear all button use the global classes from 4.5 of the shared spec (rows 4, 5 and 6).

---

## 2. Layout

### 2.1 First visit (nothing added yet)

```
                      Down[4]More                  <- wordmark, 60 / 800
        Paste your links and download them all in one go.
   ┌──────────────────────────────────────────────────────┐
   │ (+)  Paste a link to fetch                  [Fetch ↓] │   <- the bar
   └──────────────────────────────────────────────────────┘
```
There is **nothing below the bar**: no empty rows, no placeholders, no "URL 2".

### 2.2 After adding links

```
   │ (+)  Paste a link to fetch                  [Fetch ↓] │
   │ ───────────────────────────────────────────────────── │
   │ 1  [Video]     youtube.com/watch?v=abc…            ✕  │
   │ 2  [Playlist]  youtube.com/playlist?list=PL…       ✕  │
   │ 3  [Video]     vimeo.com/123456                    ✕  │
   │                                                       │
   │ 3 links                                  [Clear all]  │
```

- **1 to 3 links:** one column, full width.
- **4 or more links:** two columns, separated by a 1px vertical divider. The rows fill the left column top to bottom, then the right column. Rows per column = `max(3, ceil(n / 2))`, so the list keeps growing downwards and both columns stay balanced. This keeps the design's two-column look (3 + 3) while still starting empty.
- Rows are numbered **1, 2, 3, ...** in the order they were added.
- **Compact layout (720px and narrower, rev 3, assumed):** the list is **always one column**, whatever the count, and the vertical divider is not drawn. The two-column rule applies only above 720px. The card padding is `24px 16px`, the bar stays on one line (plus 44, input, Fetch 44 high) and rows keep their height of 52.

### 2.3 Style values

Everything uses tokens (shared spec, section 4). Values are from `Down4More-light.html`.

| Part | Spec |
|---|---|
| Title (h1) | 60 / 800, letter-spacing `-.02em`, centred, margin `48px 0 8px`. Contains `<d4m-logo variant="wordmark" />` (it scales with this font size). Under 720px: `clamp(36px, 9vw, 60px)` *(assumed)* |
| Subtitle | 17 / 500, `--color-text-muted`, centred, margin `0 0 32px`. Text: "Paste your links and download them all in one go." |
| Card | `<d4m-page-container size="md">` (max-width 920, padding `40px 48px 36px`) |
| Bar | flex, gap 12, `align-items: center`, `padding-bottom: 10px`, `border-bottom: 2px solid var(--color-primary)`. While the input has focus: border colour `--color-accent` |
| Plus button | `.btn.btn--circle` 44 x 44, plus icon 20 (4.5 row 4). `aria-label="Add link"` |
| Input | flex 1, no border, transparent, `font: inherit`, 20px, height 44, `min-width: 0`, colour `--color-text`, placeholder `--color-text-muted`: "Paste a link to fetch". `aria-label="Link"`, `type="url"`-style text input, `inputmode="url"`, `autocomplete="off"`, `spellcheck="false"` |
| Fetch button | `navFetch()` from `d4m-nav-buttons`, size `md`: 44 high pill, `--color-action-bg` / `--color-action-fg`, 16/700, arrow-down 20 (4.5 row 3) |
| Inline error | under the bar, margin-top 8, 13 / 700, `--color-danger`, `role="alert"` |
| List area | margin-top 28. Grid `1fr` (1 to 3 links) or `1fr 1px 1fr` (4+), gap 28. Divider `--color-border` |
| Row | flex, `align-items: center`, gap 12, height 52, padding `0 4px`, `border-bottom: 1px dashed var(--color-border)` |
| Row number | 14 / 800, `--color-accent` |
| Type chip | 12 / 700, fill `--color-border`, text `--color-text`, padding `4px 10px`, pill. Text: "Video", "Playlist" or "Link" (unknown site) |
| Row URL | flex 1, 14, `--color-text-muted`, one line with ellipsis, `title` = full URL |
| Row remove | `.btn.btn--danger` icon only, 44 x 44, x icon (4.5 row 5). `aria-label="Remove link N"` |
| Row, failed fetch | the type chip is replaced by a red tag: fill `--color-accent`, text `--color-action-fg`, text "Couldn't load" (same look as the applied tag in the shared spec, 4.6.7) |
| Footer | shown only when there is at least 1 link. margin-top 24, flex space-between, 14 / 600, `--color-text-muted`. Left: "N link" / "N links". Right: ghost button "Clear all" (`.btn.btn--sm.btn--ghost`, 4.5 row 6) |

> **Design change:** the original mock numbers rows from 2 (because the bar was "URL 1") and shows a "URL n" label and a "paste a link" placeholder. Now the bar is only an input and rows hold real links, so rows are numbered from 1 and the "URL n" label is dropped to give the link text room.

---

## 3. Components

### 3.1 `home.component` (smart)

Owns all state. Nothing in `url-bar` or `url-list` calls a service or the router.

```ts
export interface UrlEntry {
  id: string;
  url: string;            // normalised, what is sent to the backend
  key: string;            // used for duplicate checks
  kind: UrlKind;          // 'video' | 'playlist' | 'unknown', from parseUrl
  failed?: boolean;       // set after a fetch where this link could not be loaded
}

export const MAX_LINKS = 50;   // assumed limit, one constant to change

export class HomeComponent {
  private fetchInfo = inject(FetchInfoService);
  private router = inject(Router);

  protected links = signal<UrlEntry[]>([]);
  protected draft = signal('');                    // text currently in the bar
  protected draftError = signal<string | null>(null);
  protected fetching = signal(false);
  protected fetchError = signal<string | null>(null);

  protected canFetch = computed(() => this.links().length > 0 || this.draft().trim().length > 0);
}
```

```html
<h1 class="home__title"><d4m-logo variant="wordmark" /></h1>
<p class="home__sub">Paste your links and download them all in one go.</p>

<d4m-page-container size="md">
  <d4m-url-bar [(value)]="draft" [error]="draftError()" [loading]="fetching()" [canFetch]="canFetch()"
               (add)="addFromDraft()" (fetch)="fetch()" />
  @if (fetchError()) { <p class="home__error" role="alert">{{ fetchError() }}</p> }
  @if (links().length) {
    <d4m-url-list [entries]="links()" [disabled]="fetching()" (remove)="remove($event)" (clear)="clear()" />
  }
</d4m-page-container>
```

### 3.2 `d4m-url-bar` (dumb)

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `value` | `model<string>` | `''` | the text in the box, two-way `[(value)]` |
| `error` | `string \| null` | `null` | inline message under the bar |
| `loading` | `boolean` | `false` | Fetch shows its spinner, the plus button and the input are disabled |
| `canFetch` | `boolean` | `false` | Fetch is disabled when `false` |

| Outputs | Type | Notes |
|---|---|---|
| `add` | `void` | plus pressed, or Enter pressed in the input |
| `fetch` | `void` | Fetch pressed |

Fetch is a `d4m-nav-buttons` holding one button: `{ ...navFetch(), disabled: !canFetch(), loading: loading() }`. The plus button is disabled while `value` is empty or `loading` is true.

### 3.3 `d4m-url-list` (dumb)

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `entries` | `UrlEntry[]` (required) | | |
| `disabled` | `boolean` | `false` | while fetching: remove and Clear all are disabled |

| Outputs | Type |
|---|---|
| `remove` | `string` (the entry id) |
| `clear` | `void` |

It decides the one-column or two-column layout and the rows per column from `entries().length` (section 2.2). **(rev 3)** The two-column state is a CSS class (`.two-col`), not an inline style, so the compact layout can override it with `grid-template-columns: 1fr` and hide the divider, with no TypeScript change. It shows the footer. It never changes `entries`.

---

## 4. Behaviour in detail

### 4.1 Adding a link (the plus button, or Enter)

1. Take the text in the bar and split it on whitespace, commas and new lines. This lets the user paste several links at once, and each becomes its own row.
2. For each piece, run `parseUrl` (section 6):
   - not a link: skip it, error "That doesn't look like a link."
   - already in the list (same `key`): skip it, error "Already in the list."
   - list already has `MAX_LINKS`: stop, error "You can add up to 50 links."
   - otherwise: append a new `UrlEntry` at the **end** of the list.
3. If everything was added, **clear the bar** and clear the error. If something was skipped, keep **only the skipped text** in the bar and show the error, so nothing the user typed is lost.
4. Focus stays in the bar so the next paste is immediate.
5. A polite live region announces "Link added, N links in the list".

Empty bar: the plus button is disabled and Enter does nothing.

### 4.2 Removing

The x on a row removes it and moves focus back to the bar. **Clear all** removes every row (no confirmation, the links are easy to paste again). The error and any "Couldn't load" marks are cleared with them.

### 4.3 Fetch

1. If the bar has text, add it first with the rules in 4.1. If that fails, stop and show the error (the user fixes it before fetching).
2. If the list is empty, do nothing (Fetch is disabled anyway).
3. Set `fetching` to true. The Fetch button shows its spinner, the bar, the plus button and the list controls are disabled.
4. Call `FetchInfoService.load(urls)`, which calls `ApiService.fetchInfo(urls)`.
5. On success, navigate by the rules in section 5.
6. On failure, see section 7.

### 4.4 Keyboard

Enter in the bar = plus. Tab order: plus, input, Fetch, then the rows' remove buttons, then Clear all.

---

## 5. Where the user lands: video, playlist or batch

The decision is made from the links. Two layers, so it is instant on the page and still correct when the real backend arrives:

- **On the page (instant):** `parseUrl` labels each row "Video", "Playlist" or "Link" while the user adds it.
- **At fetch time:** `ApiService.fetchInfo(urls)` returns a `FetchResult` whose `kind` is the answer. The **mock** backend uses the same `parseUrl` rules, and the **real** backend (yt-dlp) knows for sure. If the page label and the backend disagree, **the backend result wins**.

| Links in the list | Link type | Result `kind` | Navigate to |
|---|---|---|---|
| exactly 1 | video | `single` | `/single` |
| exactly 1 | playlist | `playlist` | `/playlist/select` |
| exactly 1 | unknown site | whatever the backend says | `/single` or `/playlist/select` |
| 2 or more | any mix | `playlist` (a batch) | `/playlist/select` |

For a batch, every playlist link inside it is **expanded into its videos**, and all videos from all links are shown together in one list on the Select page.

**Hand-off to the next page:** the result stays in `FetchInfoService` (a signal `lastResult`). `Single` and `Select` read from it. Nothing is passed through router state or the URL, so refreshing the next page without a result sends the user back to Home.

---

## 6. URL parser (core)

`core/utils/parse-url.ts` is a **pure function** (no Angular, unit-tested). `UrlParserService` just exposes it for injection.

```ts
export type UrlKind = 'video' | 'playlist' | 'unknown';

export type ParsedUrl =
  | { valid: false; reason: 'empty' | 'not-a-link' }
  | { valid: true; url: string; key: string; kind: UrlKind };

export function parseUrl(raw: string): ParsedUrl;
```

**Validity**
- Trim the text. Empty gives `empty`.
- No scheme (for example `youtube.com/watch?v=x`): add `https://`.
- Must parse with `new URL`, the scheme must be `http` or `https`, and the host must contain a dot. Otherwise `not-a-link`.

**Normalisation (`url` and `key`)**
- Lowercase the host, remove the `#fragment`, remove a trailing `/`.
- Remove tracking parameters `si`, `feature`, `pp`, and `utm_*`.
- `key` is the normalised string, so the same link pasted twice is caught.

**Kind rules** (first match wins):

| Host | Pattern | Kind |
|---|---|---|
| youtube.com, m., music., www. | path starts with `/playlist` | `playlist` |
| | path `/watch` with `v=` (even if `list=` is also there) | `video` *(the specific video wins, assumed)* |
| | `list=` present and no `v=` | `playlist` |
| | path `/shorts/…`, `/live/…`, `/embed/…` | `video` |
| | path `/@name`, `/channel/…`, `/c/…`, `/user/…` | `playlist` *(a channel is a list of videos)* |
| youtu.be | `/<id>` (with or without `list=`) | `video` |
| any other host | path contains `/playlist`, `/playlists/`, `/sets/`, `/album/`, `/showcase/`, or has `list=` | `playlist` |
| any other host | anything else | `unknown` (shown as "Link", the backend decides) |

**Unit tests (required):** empty, spaces, `not a url`, scheme added, ftp rejected, host without a dot, tracking params stripped, duplicate key equality, every row of the kind table, and a watch URL with both `v=` and `list=`.

---

## 7. States and errors

| State | What the user sees |
|---|---|
| Empty (first visit) | the bar only, nothing below, Fetch disabled |
| Typing | plus enabled, Fetch enabled |
| Invalid / duplicate / limit | red message under the bar, text kept in the box |
| Has links | rows and footer appear, Fetch enabled |
| Fetching | Fetch spinner, bar and list controls disabled, rows stay visible |
| All links failed | stay on Home, every row gets the red "Couldn't load" tag, message under the card: "None of the links could be loaded. Check them and try again." Fetch is enabled again. Pressing it retries all rows |
| Some links failed | navigate with the ones that worked. The failures are saved in `FetchResult.failed`, and the Select page shows the notice "N links couldn't be loaded" (Select spec, section 4) |
| Backend unreachable | message under the card: "Couldn't reach the downloader. Try again." Rows unchanged |
| 50 links | plus disabled, message "You can add up to 50 links." |

---

## 8. Data

Added to `core/models/` (the `fetchInfo` contract in the shared spec, 2.1, already names `FetchResult`; this is its shape):

```ts
export interface FetchFailure { url: string; reason: string; }

export interface FetchResult {
  kind: 'single' | 'playlist';          // 'playlist' also means a multi-link batch
  items: MediaItem[];                    // 1 item for 'single'
  catalog: DownloadOptionsCatalog;       // the main catalog, and the fallback for items without their own MediaItem.catalog (Down4More-Per-Video-Options-Spec.md)
  failed: FetchFailure[];                // links that could not be loaded
  title?: string;                        // playlist title when the batch is one playlist link
}
```

```ts
// fetch-info.service.ts
@Injectable({ providedIn: 'root' })
export class FetchInfoService {
  private api = inject(ApiService);
  readonly lastResult = signal<FetchResult | null>(null);
  load(urls: string[]): Observable<FetchResult> {
    return this.api.fetchInfo(urls).pipe(tap(r => this.lastResult.set(r)));
  }
}
```

**Navigation after success** (in `home.component`):

```ts
const ok = result.items.length > 0;
if (!ok) { /* all failed: mark rows, show message, stay */ return; }
this.router.navigate(result.kind === 'single' ? ['/single'] : ['/playlist', 'select']);
```

**⚙ Backend later:** replace `MockApiService` with the real one in `app.config.ts`. Home, `UrlParserService` and the pages do not change.

---

## 9. Mock data for Home

`MockApiService.fetchInfo(urls)`, resolves after about 600 ms:
- uses `parseUrl` on each link
- a `video` or `unknown` link gives one item from `MOCK_MEDIA_ITEMS`
- a `playlist` link gives 9 items (the names from the Batch design: "Rocket landing, full broadcast", "How tides actually work", ...)
- any link whose text contains `fail` goes into `failed`, so the error states can be tried
- `kind` is `single` only when there is exactly one link and it gave exactly one item

---

## 10. Accessibility

- The input has `aria-label="Link"` and the plus button has `aria-label="Add link"`.
- The list is a real `<ul>`. Each remove button has `aria-label="Remove link N"`.
- Errors use `role="alert"`. "Link added" and "Link removed" use a visually hidden `aria-live="polite"` region.
- Fetch `loading` state also sets `aria-busy="true"` on the card.
- Never colour alone: the failed row has the text "Couldn't load", the type is always a text chip.
- Visible focus ring on every control (shared spec 4.7).

---

## 11. Playground (`/dev`)

`d4m-url-bar`: empty, with text, error, loading, fetch disabled. `d4m-url-list`: 1 link, 3 links, 4 links (two columns start), 7 links, 50 links, a very long URL, a failed row, disabled. Both in light and dark.

---

## 12. Done when

- [ ] First visit shows only the bar, with nothing below it.
- [ ] Plus (and Enter) moves the typed link into the list, clears the bar, and keeps focus in the bar.
- [ ] Invalid and duplicate links are rejected with a message and the text is kept.
- [ ] Pasting several links at once adds one row each.
- [ ] 1 to 3 links show one column, 4 or more show two balanced columns, growing downwards. In the compact layout (390px wide) it is always one column.
- [ ] One video link lands on Single, one playlist link on Select, two or more links on Select.
- [ ] All failed, some failed and backend-down states behave as in section 7.
- [ ] `parseUrl` passes every unit test in section 6.
- [ ] Looks match the design in light and dark, and passes the checklist in section 9 of the shared spec.

---

## 13. Choices I made that you can change

1. Rows are numbered from 1 and the "URL n" label is dropped (section 2.3).
2. One column for 1 to 3 links, two columns from 4 (section 2.2).
3. A watch link that has both `v=` and `list=` counts as a **video**. A YouTube channel link counts as a **playlist** (section 6).
4. Maximum 50 links (`MAX_LINKS`).
5. When only some links fail, the page still continues with the ones that worked (section 7).
6. "Clear all" and the "N links" footer are included because the mock's CSS defines a footer, even though its HTML does not use it.
