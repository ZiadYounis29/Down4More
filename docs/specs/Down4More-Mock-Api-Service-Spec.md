# Down4More: Mock API Service Spec

> **Scope:** `src/app/core/services/mock-api.service.ts` and `src/app/core/mocks/mock-data.ts`. This is the file the Project Tree flagged as missing ("Open points #5": *"`mock-api.service.ts` has no consolidated spec. Its rules are spread over four specs (Home §9, Flow §6, Downloads §8, History §8), so it is worth merging them into the Core spec."*). This document is that merge. It defines no new behaviour — every rule below already exists in one of those four specs — it just makes `MockApiService` buildable from one file instead of four.
> **Companions:** `Down4More-Shared-Components-Spec.md` §2 (the `ApiService` contract this class implements, and the backend-agnostic swap point), `Down4More-Home-Page-Spec.md` §9, `Down4More-Playlist-Flow-Spec.md` §6, `Down4More-Downloads-Page-Spec.md` §8, `Down4More-History-Page-Spec.md` §8 (the four source sections this spec consolidates — kept as the source of truth for individual numbers; this file is the source of truth for how they fit together as one running service).
> **Backend:** this *is* the mock backend. There is nothing behind it. It exists entirely so every page spec's "no backend yet" claim is actually true in a buildable way (per the routing spec's milestone checklist). The real backend replaces this whole file; nothing else in the app changes (shared spec §2.1).
> **(rev 4)** `Down4More-Per-Video-Options-Spec.md` adds per-video catalogs (3.1, 4.1) and makes `startDownloads` resolve each request against its video's catalog (3.2). The mock stands in for backend work here.

---

## 0. The job in one minute

One `MockApiService` implements the four methods of `ApiService` (shared spec §2.1) entirely in memory, backed by one shared mutable store so that **Downloads and History see a consistent picture of the same downloads** — a download that finishes in the Downloads mock must be the same object History later returns, not a second, independently-generated one. Nothing here persists across a page reload (no `localStorage`); a reload reseeds the mock from its static data.

---

## 1. Files

```
core/
├─ services/
│  └─ mock-api.service.ts     (this spec, §3)
└─ mocks/
   └─ mock-data.ts            (this spec, §4 — MOCK_MEDIA_ITEMS, MOCK_CATALOG, MOCK_DOWNLOADS, MOCK_HISTORY)
```

---

## 2. The contract being implemented (recap, shared spec §2.1 — not redefined here)

```ts
export abstract class ApiService {
  abstract fetchInfo(urls: string[]): Observable<FetchResult>;
  abstract startDownloads(requests: DownloadRequest[]): Observable<void>;
  abstract downloads$(): Observable<DownloadItem[]>;
  abstract control(action: DownloadAction, ids: string[]): Observable<void>;
  abstract history(query?: string): Observable<DownloadItem[]>;
}
```

---

## 3. One shared store

This is the piece no single page spec needed to describe, because each only saw its own slice of it. It is the actual reason a consolidated spec is worth writing.

```ts
@Injectable({ providedIn: 'root' })
export class MockApiService extends ApiService {
  /** Every download of the current app session: queued, active, paused, done or failed.
   *  Downloads reads a filtered/live view of this. History reads the done/failed subset.
   *  Dismiss hides an item from the Downloads view without touching this store.
   *  Remove and Cancel delete the record from this store outright. */
  private readonly store = signal<DownloadItem[]>(seedFromMockDownloads());   // §4.3
  private readonly dismissed = signal<Set<string>>(new Set());               // ids hidden from Downloads, still in store
  private nextPriority = 1000;                                               // new items always go to the back of the queue
  private tickHandle?: ReturnType<typeof setInterval>;
}
```

**Why one store and not two arrays:** the Downloads spec's own "choices you can change" (§11.2–11.3) distinguishes *dismiss* (hide from Downloads, keep the History record) from *remove* (delete the History record) and from *cancel* (delete the item, leave no trace). All three only make sense if Downloads and History are views over the same underlying list, not separate mock arrays that could drift apart. The History spec's "one store shared with Downloads" line (§8) says this explicitly but never shows the shape — this does.

---

## 3.1 `fetchInfo(urls: string[]): Observable<FetchResult>`

Resolves after **≈600 ms** (Home spec §9, Shared spec §2.3).

1. Run `parseUrl` (Home spec §6) on each URL to get its `kind` and normalised `key`.
2. For each URL:
   - contains the substring **`fail`** → push a `FetchFailure` into `failed` (Home spec §9) and skip it, no item is produced.
   - `kind === 'video'` or `'unknown'` → one item from `MOCK_MEDIA_ITEMS`, cycling through the list so repeated fetches don't collide on `id`.
   - `kind === 'playlist'` and the URL contains **`big`** → generate **300** synthetic items (id, title, random-ish duration/size) for the virtual-scroll stress case (Flow spec §6).
   - `kind === 'playlist'` otherwise → the fixed **9 items** from the Flow spec's table (§6), in that exact order, every time (so the Select/Options pages' "Rocket landing, full broadcast" etc. demo data is reproducible).
3. `kind` of the result: `'single'` only when there is exactly one URL and it produced exactly one item; otherwise `'playlist'` (Home spec §9's rule, which also covers the "2+ links" batch case — Home spec §0).
4. `catalog` is always `MOCK_CATALOG` (§4.2), regardless of which items were returned. **(rev 4)** Individual items may carry their own `catalog` (three playlist items do, §4.1): `fetchInfo` returns them unchanged.
5. If **every** URL failed, `items` is empty and the page stays on Home (Home spec §7); this method still resolves normally — Home's "all failed" UI state is a property of an empty `items` array, not a thrown error.
6. One extra, specific case for state-coverage (Flow spec §6): across the 9 playlist items, one gets a very long title, one gets `thumbnailUrl: null`, one gets `sizeBytes: null`, one gets `durationSec: null`. These are fixed to the **same** items every time, not randomised, so screenshots and tests are stable.

```ts
fetchInfo(urls: string[]): Observable<FetchResult> {
  return of(buildFetchResult(urls)).pipe(delay(600));
}
```

---

## 3.2 `startDownloads(requests: DownloadRequest[]): Observable<void>`

From Single (array of 1) or Playlist Options (array of N) — batch-first, same method either way (shared spec §2.2).

1. For each request, create a `DownloadItem` from `request.item` + `request.settings`: `status: 'queued'`, `progress: 0`, `downloadedBytes: 0`, `priority: this.nextPriority++` (always appended to the **end** of the queue — Downloads spec §8).
   **(rev 4)** `settings` is the request's settings **resolved** against `request.item.catalog ?? MOCK_CATALOG`: `quality` via `fallbackQuality` (nearest lower, else the lowest above), `bitrate` via `nearestBitrate`, `format` reset to the first valid one for the mode if it is not available. This is backend work, so the frontend never does it; the resolved settings are what Downloads shows.
2. Append all of them to `store`.
3. Ensure the tick loop (§3.3) is running — starting the first download of a session starts the interval; it is not pre-started on app boot.
4. Resolves immediately (`of(undefined)`); the *effect* of starting shows up a tick later via `downloads$()`.

---

## 3.3 `downloads$(): Observable<DownloadItem[]>`

A live stream, emitting the **full current list every ~1 second** (`auditTime(250)` is the consumer-side throttle in `ProgressService`, not this method — this method just ticks on its own 1 s timer, Downloads spec §8). **Must include every download of the session, finished and failed ones too** — the Done/Downloading/Failed pills count them (Downloads spec §8, and its "choices" §11.7 flags this as a hard requirement for whoever eventually writes the real backend).

Tick logic, run once per second over `store`:

1. **Concurrency cap: at most 3 items `downloading` at once** (Downloads spec §8). If fewer than 3 are downloading and any are `queued`, start the lowest-priority-number queued item(s) until the cap is reached or the queue is empty.
2. Each `downloading` item advances `downloadedBytes` by its mock `speedBps`, and `progress`/`etaSec` are derived from that against `totalBytes`.
3. At `progress === 100`, the item becomes `processing` for **3 seconds** (no buttons during this — Downloads spec §9, rev-3 note: ffmpeg merging cannot be paused), then `done`, with `finishedAt` set to the current time.
4. Items the mock marks as failing (a small fixed subset so the Failed pill is never empty, plus any item `control('cancel'...)`'d — no, cancel deletes outright, see §3.4) get `status: 'failed'` with a human-readable `error` (e.g. `"Video unavailable"`, `"Network error"` — History spec §8).
5. The emitted array is `store()` **filtered to exclude ids in `dismissed`** — dismiss only affects this view, never the underlying store (§3 above).

```ts
downloads$(): Observable<DownloadItem[]> {
  return interval(1000).pipe(
    startWith(0),
    map(() => this.advanceOneTick()),              // mutates `store`, returns nothing — see below
    map(() => this.store().filter(d => !this.dismissed().has(d.id))),
  );
}
```

---

## 3.4 `control(action: DownloadAction, ids: string[]): Observable<void>`

One method, seven actions (`download-item.model.ts`, shared spec §3; `'prioritize'` and `'dismiss'` added by the Downloads spec, §9):

| Action | Effect on `store` / `dismissed` |
|---|---|
| `pause` | matching items → `status: 'paused'`, `speedBps: null`, `etaSec: null` (Downloads spec §8) |
| `resume` | matching `paused` items → `status: 'queued'` (re-enters the concurrency race, §3.3 step 1) |
| `cancel` | matching items **deleted from `store`** entirely — "leaves no trace" (Downloads spec §11.3) |
| `retry` | matching `failed` items → `status: 'queued'`, `error` cleared. This **moves the item out of History and into the live Downloads queue** — the same store, just a different status, so no copying is needed (History spec §11.3 explicitly rejects the design-file's in-place "flip to Succeeded" behaviour as a demo stand-in) |
| `remove` | matching items **deleted from `store`** entirely — History-only action, deletes the permanent record, never the file on disk (History spec §11.4) |
| `prioritize` | matching items get the **lowest** priority numbers of anyone in `store` (so they sort first in the queue — Downloads spec §8, §11.5) |
| `dismiss` | matching items' ids are added to `dismissed` (§3 above) — **hides from Downloads only**, the History record is untouched (Downloads spec §9) |

`pause`/`resume`/`cancel`/`retry`/`prioritize`/`dismiss` all come from the Downloads page; `retry`/`remove` also come from History, on the same method with the same `store`.

---

## 3.5 `history(query?: string): Observable<DownloadItem[]>`

Returns every item in `store` whose `status` is `'done'` or `'failed'`, **newest `finishedAt` first**, filtered by `title` containing `query` (case-insensitive) when given. **Not dismiss-filtered** — a dismissed-from-Downloads item still appears in History, since dismiss only hides the live queue view (§3 above matches History spec §8: *"`control('dismiss', ids)` does not touch History"*).

This **completes after one emission** (unlike `downloads$()`), matching History spec §3.1's "loaded when the page opens, does not live-update while open" behaviour:

```ts
history(query?: string): Observable<DownloadItem[]> {
  const rows = this.store()
    .filter(d => d.status === 'done' || d.status === 'failed')
    .filter(d => !query || d.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
  return of(rows);
}
```

---

## 4. Mock data

The numbers themselves already exist in their page specs and are **not duplicated in full here** — this section only says how the four sets combine into one `mock-data.ts` and seed the shared store.

### 4.1 `MOCK_MEDIA_ITEMS`

Source of truth: Flow spec §6 (the 9-item playlist table) plus Home spec §9's instruction to reuse one of these for single/unknown-kind fetches. At least 12 items total so a single-video fetch has variety across repeated tries, including one very-long-title item, one with no thumbnail, one with `durationSec: null` (Project Tree's description of this file). **(rev 4)** Three of the 9 playlist items (p-4, p-8, p-9) carry their own `catalog`; the others and all generated items have none. Values: `Down4More-Per-Video-Options-Spec.md` section 3.

### 4.2 `MOCK_CATALOG`

Source of truth: Flow spec §6. One fixed object: qualities `2160p 1440p 1080p 720p 480p 360p`; video formats `mp4 mkv webm`; audio formats `mp3 m4a opus wav`; bitrate `{ min: 32, max: 320, step: 1 }`. Used by every `fetchInfo()` result, regardless of which items it returned.

### 4.3 `MOCK_DOWNLOADS` (seeds the live store, §3)

Source of truth: Downloads spec §8 (the 7-row table, plus one `queued`, one `paused`, four `done`, two `failed`, and the long-title / no-thumbnail / unknown-size edge cases). This is the **initial contents** of `store` when the app boots — not a separate dataset from History's, because `MOCK_HISTORY`'s `done`/`failed` rows (§4.4) must be reachable by filtering this same array, per the one-store design in §3.

### 4.4 `MOCK_HISTORY`

Source of truth: History spec §8 (8 named rows plus 62 generated older entries spanning ~4 months, one dated in the previous year). **This is not a fourth independent array.** Its 8 named rows are the `done`/`failed` subset of `MOCK_DOWNLOADS` (§4.3) by construction — the History spec's own "one store shared with Downloads" line requires this. The 62 generated filler entries are appended to the same `store` at boot, already `done`/`failed` with a `finishedAt` in the past, so they show up in History immediately but never appear in the live Downloads queue (they are not `queued`/`downloading`/`paused`/`processing`).

---

## 5. Determinism and reset

- Nothing here persists across a reload. `MockApiService` is `providedIn: 'root'`, so its `store` lives exactly as long as the Angular app instance does — a hard reload reseeds everything from §4.3/§4.4 (this matches the Routing spec's §6 "refresh behaviour" table: `/downloads` and `/history` "reload fine," but with a fresh mock run, not the state you left).
- The tick loop (§3.3) should only run while at least one subscriber to `downloads$()` is active (`share()`/`refCount`), so it does not keep ticking (and burning CPU) while the user is on Home or History.
- Random-looking numbers (the "big" 300-item generator, synthetic failed-row error text) should use a fixed seed or fixed pattern, not `Math.random()`, so the same demo state reproduces for screenshots and the `/dev` playground.

---

## 6. Done when

- [ ] `fetchInfo` reproduces every case in Home spec §9 and Flow spec §6: single video, single playlist (exact 9 named items, in order), 2+ link batch, `fail`-containing URL, `big`-containing URL (300 items).
- [ ] A download started from Single and a batch started from Playlist Options both land in the **same** `downloads$()` stream, obeying the 3-at-a-time concurrency cap.
- [ ] A `done` or `failed` item from `downloads$()` is the exact same record `history()` later returns (same id, same `finishedAt`) — no duplication, no drift.
- [ ] `dismiss` removes an item from the Downloads view but it still appears in History; `remove` removes it from History but it was already gone from Downloads; `cancel` removes it from both with no trace anywhere.
- [ ] `retry` on a failed History row makes it reappear in Downloads as `queued` and disappear from History, in the same tick cycle.
- [ ] **(rev 4)** `startDownloads` resolves a quality the video lacks to the nearest lower one (p-4 asked for 2160p becomes 1080p), and Downloads shows the resolved settings.
- [ ] A hard reload resets the store to the §4.3/§4.4 seed data exactly, every time.
- [ ] No method in this file ever imports anything from `features/` — it only depends on `core/models` and `core/mocks` (shared spec §1 rule 8, applied here even though this file is `core`, not `shared`).
- [ ] Swapping `MockApiService` for a real implementation in `app.config.ts` (Routing spec §3) requires no change anywhere else — verified by grepping for `MockApiService` outside this file.

---

## 7. Choices made that you can change

1. One shared in-memory `store` for both Downloads and History, rather than two independently seeded arrays that happen to look consistent. This is the one real design decision this spec adds beyond what the four source specs said; it was implied by History spec §8 ("one store shared with Downloads") but never written down as a data shape.
2. The tick loop only runs while `downloads$()` has a subscriber, to avoid background work on pages that don't need it. If you'd rather it run for the whole app session (so Downloads keeps progressing while you're on History), remove the `share()`/`refCount` and start it once at service construction instead.
3. Fixed, non-random mock data (§5) so demos and screenshots reproduce. If you want visible variety between runs, seed a PRNG instead of hand-picking fixed values — but keep it seeded, not `Math.random()`, so bug reports are reproducible.
