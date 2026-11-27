# Down4More: Project Tree

> Updated to match the specs (shared spec rev 3, Core, Home, Single, Playlist Flow / Select / Options, Downloads, History).
> **Status tags:** **[S]** fully specified · **[D]** described in a spec but no file layout or code · **[M]** needed by the specs but not specified anywhere · **[?]** in your tree, but no spec uses it yet.
> The backend folder is a placeholder (backend choice still open). Its contract is `ApiService` (shared spec 2.1).
> **(rev 5)** `Down4More-Single-Page-Style-Notes.md` (the Trim panel's look) is recreated and added to `docs/specs/`. It is a spec file, so it has no folder in the tree; `features/single/components/trim-video/` below points to it.
> **(rev 4)** Added by `Down4More-Per-Video-Options-Spec.md`: optional `MediaItem.catalog`, `core/utils/fallback-quality.ts`, and per-video fallback inside `MockApiService.startDownloads`.

```
down-4-more/
├─ backend/                                   [?] Electron main / Node / Python, choice still open
│  ├─ routes/
│  │  ├─ fetch-info                           (ApiService.fetchInfo)
│  │  ├─ download                             (ApiService.startDownloads + control: pause, resume, cancel,
│  │  │                                        retry, prioritize, dismiss, remove)
│  │  ├─ progress                             (ApiService.downloads$: a live stream, SSE or WebSocket.
│  │  │                                        Must include finished and failed items of the session)
│  │  └─ history                              (ApiService.history(query?))
│  └─ services/
│     ├─ ytdlp-runner
│     └─ ffmpeg-runner
│
├─ tsconfig.json                              [M] path aliases @core/*, @shared/*, @features/* (shared rule 9)
│
└─ src/
   ├─ main.ts
   ├─ index.html                              [S] Manrope 500/600/700/800 loaded once
   ├─ styles.scss                             [S] tokens (shared 4.2 to 4.4, plus the seven --trim-* tokens from Single Style Notes 6), global .btn classes (4.5),
   │                                              .visually-hidden (4.8), @use 'styles/breakpoints'
   ├─ styles/
   │  └─ _breakpoints.scss                    [S] $bp-compact: 720px, @mixin compact (shared 4.4)
   │
   └─ app/
      ├─ app.component.ts / .html / .scss     [S] shell: nav-bar + <main><router-outlet/></main> (Core)
      ├─ app.config.ts                        [D] provides { ApiService -> MockApiService } (the one swap point)
      ├─ app.routes.ts                        [D] lazy loadComponent per page. The tree below shows the routes:
      │                                           ''            -> features/home
      │                                           'single'      -> features/single
      │                                           'playlist'    -> loadChildren (playlist.routes.ts)
      │                                           'downloads'   -> features/downloads
      │                                           'history'     -> features/history
      │                                           'settings'    -> features/settings   [?]
      │                                           'dev'         -> dev playground, only when not in production [D]
      │
      ├─ core/
      │  ├─ layout/
      │  │  └─ nav-bar/                       [S] nav-bar.component.ts / .html / .scss
      │  │                                        (logo link, Downloads | History | Settings, theme toggle)
      │  │
      │  ├─ models/
      │  │  ├─ media-item.model.ts            [S] MediaItem (+ optional `catalog`, Per-Video spec 1)  (was video-data.model.ts)
      │  │  ├─ download-settings.model.ts     [S] MediaMode, CaptionSettings, DownloadSettings,
      │  │  │                                     DownloadOptionsCatalog
      │  │  ├─ download-item.model.ts         [S] DownloadStatus, DownloadItem, DownloadAction
      │  │  │                                     ('prioritize' and 'dismiss' included), DownloadActionEvent
      │  │  ├─ history-entry.model.ts         [S] HistoryEntry
      │  │  ├─ download-request.model.ts      [S] DownloadRequest, SingleExtras, TrimSegment, FrameSizeSettings
      │  │  └─ fetch-result.model.ts          [S] FetchResult, FetchFailure
      │  │
      │  ├─ services/
      │  │  ├─ api.service.ts                 [S] abstract class, the contract (shared 2.1)
      │  │  ├─ mock-api.service.ts            [D] fetchInfo, startDownloads, downloads$, control, history.
      │  │  │                                     Rules spread over the Home, Flow, Downloads, History specs
      │  │  ├─ theme.service.ts               [S] signal + data-theme + localStorage (Core)
      │  │  ├─ url-parser.service.ts          [S] thin wrapper around parse-url (Home)
      │  │  ├─ fetch-info.service.ts          [S] load(urls), lastResult signal (Home)
      │  │  ├─ download.service.ts            [S] start(requests), control(action, ids) (Flow + Downloads)
      │  │  ├─ progress.service.ts            [S] live list of downloads, auditTime(250) (Downloads)
      │  │  ├─ history.service.ts             [S] items, status, load(), drop(id) (History)
      │  │  └─ settings.service.ts            [?] no Settings spec yet, so no defined job
      │  │
      │  ├─ mocks/
      │  │  └─ mock-data.ts                   [D] MOCK_MEDIA_ITEMS, MOCK_CATALOG (Flow 6), MOCK_DOWNLOADS
      │  │                                         (Downloads 8), MOCK_HISTORY (History 8)
      │  │
      │  ├─ pipes/                            [D] duration and fileSize pipes (shared 3). Folder is a suggestion
      │  │  ├─ duration.pipe.ts
      │  │  └─ file-size.pipe.ts
      │  │
      │  └─ utils/                            (pure functions, no Angular, each with a .spec.ts)
      │     ├─ apply-option-rules.ts          [S] the mode dependency rules (shared 6.4), also clamps quality (Per-Video 2.2)
      │     ├─ fallback-quality.ts            [S] nearest lower quality, else lowest above (Per-Video 2.2)
      │     ├─ default-download-settings.ts   [D] values in Flow 6: video+audio, 1080p, mp4, bitrate 300
      │     ├─ format-duration.ts             [S] 3725 -> '1:02:05', null -> '—'
      │     ├─ format-size.ts                 [S] unit 'auto' | 'mb' (History 3.3)
      │     ├─ format-speed.ts                [D] '17.2 MB/s'
      │     ├─ format-eta.ts                  [D] '40 hrs'
      │     ├─ format-when.ts                 [S] History 3.2
      │     ├─ parse-url.ts                   [S] Home 6
      │     ├─ sanitize-name.ts               [S] Single 6
      │     ├─ settings-tag.ts                [S] Flow 5
      │     └─ same-settings.ts               [S] Flow 5
      │
      ├─ shared/
      │  ├─ ui/                               [S] primitives, APPROVED (shared 5). Look: 4.6. Build first
      │  │  ├─ icon/                          names: plus x pause play check retry arrow-down arrow-up
      │  │  │                                        chevron-left chevron-right trash warning moon sun search
      │  │  ├─ checkbox/                      (with indeterminate)
      │  │  ├─ toggle/                        (the switch)
      │  │  ├─ segmented-control/
      │  │  ├─ select/
      │  │  ├─ progress-bar/
      │  │  ├─ panel/
      │  │  ├─ tag/
      │  │  └─ thumb-box/                     (input bordered, default true)
      │  │
      │  └─ components/                       (each folder: .ts .html .scss .spec.ts index.ts)
      │     ├─ page-container/                [S] size sm|md|lg, padding, layout stack|split,
      │     │                                     slots header, footer, main, side
      │     ├─ logo/                          [S] variants mark | wordmark, one SVG
      │     ├─ nav-buttons/                   [S] config-driven. nav-buttons.presets.ts: navBack, navNext,
      │     │                                     navFetch, navDownload, navApply
      │     ├─ download-options/              [S] wrapper (signal model + applyOptionRules, NO FormGroup),
      │     │  │                                  layout stacked | contents
      │     │  ├─ captions/                   two selects: Caption + Separate file
      │     │  ├─ video-audio-select/
      │     │  ├─ quality/
      │     │  ├─ format/
      │     │  └─ bitrate/
      │     ├─ media-thumbnail/               [S] variants single | pre-select | option-select
      │     │                                     (inputs showCheckbox, appliedTag)
      │     ├─ download-info/                 [S] variants small | big | history
      │     └─ item-container/                [S] virtual scroll, select-all, visibleRows, summary,
      │                                           item-template.directive.ts (d4mItem), slots toolbar, empty
      │
      └─ features/
         ├─ home/                             [S] route ''
         │  ├─ home.component.ts / .html / .scss         (title, subtitle, owns all state)
         │  └─ components/
         │     ├─ url-bar/                    plus, input, Fetch, inline error
         │     └─ url-list/                   the rows, "N links", Clear all (1 or 2 columns)
         │
         ├─ single/                           [S] route 'single'
         │  ├─ single.component.ts / .html / .scss         (grid of 10 named blocks)
         │  └─ components/
         │     ├─ file-name/
         │     ├─ toggle-panel/               (the expanding panel, Frame Size and Trim are built on it)
         │     ├─ frame-size/                 (options still to be designed)
         │     └─ trim-video/                 look values: Down4More-Single-Page-Style-Notes.md (own preview box, not thumb-box;
         │                                        7 new --trim-* tokens in styles.scss)
         │
         ├─ playlist/                         [S] routes 'playlist/select' and 'playlist/options'
         │  ├─ playlist.routes.ts             (no playlist.component: this folder is routes only)
         │  ├─ guards/
         │  │  ├─ has-fetch-result.guard.ts
         │  │  └─ has-chosen.guard.ts          (checks lastResult() itself first)
         │  ├─ services/
         │  │  └─ playlist-state.service.ts   chosenIds, selectedIds, draft, applied, dirty, summary.
         │  │                                  No per-item overrides
         │  ├─ select/                        step 1: choose the videos
         │  │  └─ playlist-select.component.ts / .html / .scss
         │  └─ options/                       step 2: apply settings, download
         │     └─ playlist-options.component.ts / .html / .scss
         │                                     (no sub-components: Apply and Download are buttons in the panel)
         │
         ├─ downloads/                        [S] route 'downloads'
         │  ├─ downloads.component.ts / .html / .scss      (Pause all + Priority in the toolbar)
         │  └─ components/
         │     └─ status-count/               the three status pills
         │
         ├─ history/                          [S] route 'history'
         │  ├─ history.component.ts / .html / .scss
         │  └─ components/
         │     └─ search-bar/
         │
         └─ settings/                         [?] route 'settings', no spec yet (the nav already links to it)
            └─ settings.component.ts / .html / .scss
```

---

## What changed from the tree you sent

| Area | Change |
|---|---|
| `playlist/` | `pre-fetch/` and `post-fetch/` became `select/` and `options/`. `playlist.component.ts` removed (routes only). `guards/` added. `apply-settings/` and `export-settings/` removed |
| `playlist-state.service` | the "per-item overrides" note removed (it holds the chosen ids, the ticked ids, the draft and the applied settings) |
| `home/components/` | `url-list/` added. `url-bar` is only the input bar |
| `single/components/` | `toggle-panel/` added |
| `download-options/` | "wrapper owning the FormGroup" replaced by signal model + `applyOptionRules` |
| `core/models/` | `video-data.model.ts` renamed `media-item.model.ts`. `download-request.model.ts` and `fetch-result.model.ts` added |
| `core/services/` | `mock-api.service.ts` and `theme.service.ts` added |
| `core/utils/` | 9 helpers added (only `format-duration` and `format-size` were listed) |
| New folders | `core/mocks/`, `core/pipes/` (suggested location), `shared/ui/`, `src/styles/` |
| `app.routes.ts`, `tsconfig.json` | the routes and the path aliases are now listed |
| `backend/routes/download` | also carries `control` (pause, resume, cancel, retry, prioritize, dismiss, remove) |
| Trim look (rev 5) | `Down4More-Single-Page-Style-Notes.md` recreated from the Trim boards and added. It adds seven `--trim-*` tokens to `styles.scss` (rail, track, add button, preview). Shared 4.5 row 10 and 4.6.5 updated |
| Per-video options | `Down4More-Per-Video-Options-Spec.md` added: `MediaItem.catalog`, `effectiveCatalog` in `playlist-state.service`, `fallback-quality.ts`, three mock items with their own catalog |

## Open points

1. **`features/settings/` and `settings.service.ts`**: the nav links to `/settings`, but no spec says what the page or the service does. Write a Settings spec, or drop the service until then.
2. **`shared/ui/` is approved** (shared spec section 5). It is the first thing to build, because every shared component depends on it. Each primitive still needs its own small spec (inputs, outputs, states); only the look (4.6) and the uniform API are defined.
3. **`app.config.ts` and `app.routes.ts` have no code in any spec.** The route list above is collected from the page specs.
4. **`core/pipes/` is my suggestion.** The specs say the pipes exist, but not where they live.
5. **`mock-api.service.ts` has no consolidated spec.** Its rules are spread over four specs (Home 9, Flow 6, Downloads 8, History 8), so it is worth merging them into the Core spec.
