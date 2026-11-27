# Down4More: App Routing & Navigation Spec

> **Scope:** `src/app/app.routes.ts`, `src/app/app.config.ts`, and the top-level site map. This is the file none of the other specs owned: the Project Tree's "Open points #3" noted that `app.config.ts` and `app.routes.ts` have no code in any spec, and the only place the full route list existed was reconstructed by the tree itself. This spec fixes that gap and is the single place that shows how every page connects to every other page.
> **Companions:** every page spec (each owns its own route's behaviour), `Down4More-Shared-Components-Spec.md` §2.1 (`ApiService` swap point) and §7 (reuse matrix / button-handler table, which this spec's site map is built from), `Down4More-Core-Shell-Spec.md` (nav bar), `Down4More-Playlist-Flow-Spec.md` (the one sub-flow that already had its own routes file, reused here unchanged).
> **Backend:** none. Routing and DI wiring only. The only backend-shaped thing here is the one-line provider swap in `app.config.ts`, already defined in the shared spec and repeated in §3 for completeness.

---

## 0. The whole app in one minute

Every route hangs off one shell (`app.component`, Core spec): a nav bar plus `<router-outlet>`. From there:

- **Home (`/`)** is the only entry point that calls the backend to decide where you go next: one video → **Single**, one playlist or 2+ links → **Playlist Select**.
- **Playlist Select → Playlist Options** is a fixed two-step wizard behind its own guards (already specified in the Flow spec; this file just slots it into the full tree).
- **Single** and **Playlist Options** both end at **Downloads** after a successful `startDownloads()`.
- **Downloads**, **History** and (once built) **Settings** are always reachable from the nav bar, independent of anything fetched.
- Refreshing any page past Home loses in-memory state (nothing is persisted except the theme), so every such route is guarded and falls back to Home or to an earlier step in the same flow.

---

## 1. Files

```
src/app/
├─ app.routes.ts          (this spec, §2)
├─ app.config.ts          (this spec, §3)
└─ features/
   └─ playlist/
      └─ playlist.routes.ts   (already specified in the Flow spec — unchanged, just loaded as a child here)
```

No new components, services or guards are introduced here. This file is wiring and documentation, not behaviour.

---

## 2. `app.routes.ts`

```ts
import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'single',
    canActivate: [hasFetchResultGuard, isSingleKindGuard],   // §4, rev: kind check added after the Single spec arrived
    loadComponent: () => import('./features/single/single.component').then(m => m.SingleComponent),
  },
  {
    path: 'playlist',
    loadChildren: () => import('./features/playlist/playlist.routes').then(m => m.PLAYLIST_ROUTES),
  },
  {
    path: 'downloads',
    loadComponent: () => import('./features/downloads/downloads.component').then(m => m.DownloadsComponent),
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  ...(environment.production ? [] : [{
    path: 'dev',
    loadComponent: () => import('./dev/dev-playground.component').then(m => m.DevPlaygroundComponent),
  }]),
  { path: '**', redirectTo: '' },
];
```

**Notes**

- `/single` gets `hasFetchResultGuard` here, at the top-level route. No page spec had said this explicitly — Single reads `FetchInfoService.lastResult()` exactly like the playlist pages do (Home spec §8: "Nothing is passed through router state or the URL, so refreshing the next page without a result sends the user back to Home"), so it needs the same protection. The guard itself is defined once in `features/playlist/guards/` (Flow spec §3) and imported here; it does not belong to the playlist feature conceptually, only historically. **(decision you can change:** move `hasFetchResultGuard` to `core/guards/` since both Single and Playlist now depend on it — purely a file-location choice, no behaviour change.)
- **`isSingleKindGuard` (new, `features/single/guards/is-single-kind.guard.ts`).** The Single Page Spec (§1, "Data in") states its own precondition plainly: *"If it is `null` or the kind is not `single`, redirect to `/`."* `hasFetchResultGuard` alone only checks that a result exists with ≥1 item — it says nothing about `kind`. Without this second guard, a direct URL visit to `/single` right after a playlist fetch (result exists, `kind === 'playlist'`) would pass the existing guard and load `SingleComponent`, which then does `this.result()!.items[0]` against playlist data it was never meant to read. This can't happen through normal navigation (Home always routes by `kind`, Home spec §5), but guards exist precisely for the paths normal navigation doesn't cover.

```ts
// features/single/guards/is-single-kind.guard.ts
export const isSingleKindGuard: CanActivateFn = () => {
  const result = inject(FetchInfoService).lastResult();
  if (!result) return true;   // hasFetchResultGuard (running alongside) already handles the no-result case
  return result.kind === 'single' ? true : inject(Router).parseUrl('/');
};
```
- `/playlist` delegates entirely to `playlist.routes.ts` (Flow spec §2), unchanged. See §4 below for how its two guarded children fit into the full picture.
- `/settings` has no component spec yet (Project Tree open point #1). It is wired here so the nav bar link (Core spec) does not 404, but the component itself must come from a future Settings spec. Until that exists, ship the minimal placeholder in §7.
- `/dev` is excluded from the array entirely in production builds (`environment.production`), rather than being a route that redirects — this keeps it out of the production bundle's route table, not just unreachable.
- Wildcard `**` redirects to Home rather than a 404 page. No design calls for a 404 state, so this keeps every bad link recoverable with one page.

---

## 3. `app.config.ts`

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { MockApiService } from './core/services/mock-api.service';
import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    { provide: ApiService, useClass: MockApiService },   // ⚙ the one swap point (shared spec §2.1)
  ],
};
```

This is exactly the provider line the shared spec already specifies (§2.1) — repeated here only so `app.config.ts` has a complete, standalone definition instead of being assembled by the reader from two documents. **When the real backend arrives, this is the only line in the entire app that changes** (shared spec §2.1, Home spec §8).

---

## 4. Full site map

```
                              ┌───────────────────────────┐
                              │   nav bar (every page)     │
                              │ logo → /   Downloads  History  Settings │
                              └───────────────────────────┘

   /  (Home)
   │  Fetch → ApiService.fetchInfo(urls)
   │
   ├─ exactly 1 video ───────────────────────► /single
   │                                              │  Download → startDownloads([1])
   │                                              └───────────────────────────► /downloads
   │
   └─ 1 playlist OR 2+ links ──────────────────► /playlist  (redirects to /playlist/select)
                                                     │
                                                     │  /playlist/select   (guard: hasFetchResultGuard)
                                                     │  tick videos, Next
                                                     ▼
                                                  /playlist/options   (guards: hasFetchResultGuard, hasChosenGuard)
                                                     │  Apply (frontend only) / Download → startDownloads([N])
                                                     └───────────────────────────► /downloads

   /downloads  ◄───────────────────────────────────────────────────────────────┘
   (always reachable from the nav bar; also the landing page after any successful Download)

   /history        (always reachable from the nav bar, independent of any fetch)
   /settings       (always reachable from the nav bar — component not yet specified, §7)
   /dev            (not in production; manual URL only, no nav link)
```

**Reading this against the button-handler table (shared spec §7):** that table already lists every button and whether it calls the backend. This diagram is the same information turned the other direction — not "what does this button do" but "how do I get from any page to any other page." The two should always agree; if a future page spec changes a destination, update both.

---

## 5. Guards: what exists and where each route redirects on failure

All guards already exist in `features/playlist/guards/` (Flow spec §3) and are reused, not redefined, at the top level. This table is the consolidated view across every route that uses them — no single prior spec listed it this way.

| Route | Guard(s) | Passes when | Fails to |
|---|---|---|---|
| `/` | none | always | — |
| `/single` | `hasFetchResultGuard`, `isSingleKindGuard` | result is set, has ≥1 item, **and** `kind === 'single'` | `/` |
| `/playlist/select` | `hasFetchResultGuard` | same as above | `/` |
| `/playlist/options` | `hasFetchResultGuard`, `hasChosenGuard` | result exists **and** `PlaylistStateService.chosenIds().length > 0` | no result → `/`; result but nothing chosen → `/playlist/select` |
| `/downloads` | none | always | — |
| `/history` | none | always | — |
| `/settings` | none (assumed — no spec says otherwise) | always | — |
| `/dev` | none, route absent in production | — | — |
| `**` | none | always (falls through) | `/` |

`hasChosenGuard` must check `lastResult()` itself before touching `PlaylistStateService`, because Angular runs every guard in the array regardless of an earlier redirect (Flow spec §3, rev 3 note) — this is already implemented correctly in the Flow spec's guard code and is not repeated here.

---

## 6. Refresh behaviour (what a hard reload does, per route)

Nothing except the theme (`localStorage`, Core spec) survives a reload. This table exists so "what happens on F5" is answerable for every route in one place, instead of being inferred page by page.

| Route reloaded | Result |
|---|---|
| `/` | Home, empty — as if freshly opened |
| `/single` | guard fails (no `lastResult`, or a surviving result whose `kind` isn't `single`) → `/` |
| `/playlist/select` | guard fails → `/` |
| `/playlist/options` | `hasFetchResultGuard` fails → `/`, **or** (rare: result survived somehow but nothing chosen) `hasChosenGuard` sends you to `/playlist/select` |
| `/downloads` | reloads fine — `ProgressService`/`MockApiService` reseed their in-memory mock queue from scratch (Downloads spec §8 mock data), so the *specific* in-progress state from before the reload is not preserved, only a fresh mock run |
| `/history` | reloads fine — `HistoryService` reloads from `ApiService.history()` (History spec §3.1), mock data reseeds |
| `/settings` | undefined until a Settings spec exists |
| `/dev` | reloads fine, loses whatever state the playground had |

---

## 7. Settings: minimum placeholder until a real spec exists

No design, no behaviour spec exists for `/settings` (Project Tree open point #1; `ThemeService`'s own doc comment says "The Settings page may use it later"). To keep the route from 404ing during the working-UI milestone, ship a placeholder rather than skipping the route:

```ts
// features/settings/settings.component.ts
@Component({
  selector: 'd4m-settings',
  imports: [PageContainerComponent],
  template: `
    <h1 class="visually-hidden">Settings</h1>
    <d4m-page-container size="md">
      <p>Settings are not available yet.</p>
    </d4m-page-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
```

This is intentionally minimal and should be replaced wholesale once a real Settings spec is written — it exists only so the nav bar's third link (Core spec) does something instead of breaking the milestone checklist in §9.

---

## 8. Done when

- [ ] Every route in §2 resolves to its component via lazy `loadComponent` / `loadChildren`, none eagerly loaded.
- [ ] `/dev` is present in a dev build and **absent from the route table** in a production build (verify in the built bundle, not just "unreachable").
- [ ] Navigating the full happy path works with **zero backend**, purely against `MockApiService`: `/` → Fetch a single video link → `/single` → Download → `/downloads`.
- [ ] Same for the playlist path: `/` → Fetch a playlist or 2+ links → `/playlist/select` → Next → `/playlist/options` → Download → `/downloads`.
- [ ] Reloading `/single`, `/playlist/select` and `/playlist/options` each redirect per §5/§6, with no console error and no blank page.
- [ ] `/downloads`, `/history` and `/settings` are reachable directly from the nav bar at any point, from any other page.
- [ ] An unknown URL (`/nope`) redirects to `/` instead of showing Angular's default "cannot match" error.
- [ ] Only one line changes (`app.config.ts`'s provider) when `MockApiService` is later replaced — confirmed by grepping for `MockApiService` usage outside that one file.

---

## 9. Choices made that you can change

1. `/single` was not explicitly guarded in any prior spec; it is guarded here the same way as the playlist pages, for the same reason (no backing data survives a reload), plus the `kind` check the Single spec itself requires. If you'd rather let Single render an empty/error state instead of redirecting, remove both guards and add that state to the Single spec.
2. `hasFetchResultGuard` stays physically inside `features/playlist/guards/` and is imported by the top-level route rather than moved to `core/guards/`. Either location works; moving it is a pure refactor.
3. Wildcard routes redirect to Home rather than showing a not-found page. If you want a real 404 state, that needs its own small spec (layout, message, link back).
4. `/settings` ships a one-line placeholder (§7) rather than being left out of `app.routes.ts` until it has a real spec. This keeps the nav bar fully functional for the working-UI milestone; swap the placeholder out, not the route.
