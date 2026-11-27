# Down4More: `/dev` Component Playground Spec

> **Scope:** `src/app/dev/`. This was referenced constantly but never laid out: the shared spec calls for "one page showing every shared component in every state and variant, in both themes (a toggle at the top)" (§8) and makes it part of the definition of done for *every* shared component ("Every variant and state in its spec section renders in the `/dev` playground," §9) — but no spec said what that page actually looks like.
> **Companions:** `Down4More-App-Routing-Spec.md` (owns the top-level `/dev` route and its production-exclusion — not repeated here), `Down4More-Shared-Components-Spec.md` §4–§6 (every component's states/variants, which this page exists to exercise), `Down4More-Core-Shell-Spec.md` (`ThemeService`, reused here).
> **Layout choice (confirmed):** sidebar navigation, one component per tab — not a single long scroll, not a search grid.
> **Backend:** none. Every demo uses the same mock data already defined for its real page (`core/mocks/mock-data.ts`), or small inline fixtures where no page spec already has suitable sample data.

---

## 0. The page in one minute

Opening `/dev` shows a sidebar list of every component in the app, grouped by where it lives (UI primitives, shared components, feature-local components). Clicking an entry swaps the main panel to that component's **demo**: the real component, instantiated several times, once per state/variant called out in its own spec section, with a short caption under each instance saying which state it is. A theme toggle at the top flips light/dark for every visible instance at once, so a reviewer checks both themes without leaving the tab.

---

## 1. Files and routes

```
src/app/dev/
├─ dev.routes.ts                          (child routes, one per registry entry — §3)
├─ dev-shell.component.ts / .html / .scss (sidebar + <router-outlet>, this spec's main subject)
└─ demos/
   ├─ demo-registry.ts                    (DEMO_ENTRIES — the single source for both the sidebar and the routes)
   ├─ icon.demo.component.ts
   ├─ checkbox.demo.component.ts
   ├─ toggle.demo.component.ts
   ├─ segmented-control.demo.component.ts
   ├─ select.demo.component.ts
   ├─ progress-bar.demo.component.ts
   ├─ panel.demo.component.ts
   ├─ tag.demo.component.ts
   ├─ thumb-box.demo.component.ts
   ├─ page-container.demo.component.ts
   ├─ logo.demo.component.ts
   ├─ nav-buttons.demo.component.ts
   ├─ download-options.demo.component.ts
   ├─ media-thumbnail.demo.component.ts
   ├─ download-info.demo.component.ts
   ├─ item-container.demo.component.ts
   ├─ nav-bar.demo.component.ts           (core, optional — §3)
   ├─ url-bar.demo.component.ts
   ├─ url-list.demo.component.ts
   ├─ file-name.demo.component.ts
   ├─ toggle-panel.demo.component.ts
   ├─ frame-size.demo.component.ts        (stub until the Frame Size design exists)
   ├─ trim-video.demo.component.ts
   ├─ status-count.demo.component.ts
   └─ search-bar.demo.component.ts
```

Demo components live centrally under `dev/demos/`, not inside each real component's own folder — they're dev tooling, not shipped product code, and keeping them together makes "does every component have a demo yet" a one-folder question instead of a repo-wide grep.

`dev.routes.ts` wires the top-level `/dev` route (owned by the Routing spec) to this shell and its children:

```ts
// src/app/dev/dev.routes.ts
import { Routes } from '@angular/router';
import { DEMO_ENTRIES } from './demos/demo-registry';

export const DEV_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dev-shell.component').then(m => m.DevShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: DEMO_ENTRIES[0].id },
      ...DEMO_ENTRIES.map(e => ({ path: e.id, loadComponent: e.load })),
    ],
  },
];
```

```ts
// app.routes.ts (Routing spec §2) — the '/dev' entry becomes:
...(environment.production ? [] : [{
  path: 'dev',
  loadChildren: () => import('./dev/dev.routes').then(m => m.DEV_ROUTES),
}]),
```

---

## 2. `demo-registry.ts`: the single source of truth

Adding a component to the playground is **adding one entry here** — nothing else needs to change (same pattern as `nav-bar`'s `NAV_ITEMS`, Core spec §1).

```ts
export interface DemoEntry {
  id: string;                               // route segment, e.g. 'checkbox'
  label: string;                             // sidebar text, e.g. 'Checkbox'
  group: 'Primitives' | 'Shared' | 'Feature' | 'Core';
  load: () => Promise<Type<unknown>>;        // lazy import, same shape as a route's loadComponent
}

export const DEMO_ENTRIES: DemoEntry[] = [
  // Primitives (shared/ui) — shared spec §5
  { id: 'icon',               label: 'Icon',               group: 'Primitives', load: () => import('./icon.demo.component').then(m => m.IconDemoComponent) },
  { id: 'checkbox',           label: 'Checkbox',           group: 'Primitives', load: () => import('./checkbox.demo.component').then(m => m.CheckboxDemoComponent) },
  { id: 'toggle',             label: 'Toggle',             group: 'Primitives', load: () => import('./toggle.demo.component').then(m => m.ToggleDemoComponent) },
  { id: 'segmented-control',  label: 'Segmented control',  group: 'Primitives', load: () => import('./segmented-control.demo.component').then(m => m.SegmentedControlDemoComponent) },
  { id: 'select',             label: 'Select',             group: 'Primitives', load: () => import('./select.demo.component').then(m => m.SelectDemoComponent) },
  { id: 'progress-bar',       label: 'Progress bar',       group: 'Primitives', load: () => import('./progress-bar.demo.component').then(m => m.ProgressBarDemoComponent) },
  { id: 'panel',              label: 'Panel',              group: 'Primitives', load: () => import('./panel.demo.component').then(m => m.PanelDemoComponent) },
  { id: 'tag',                label: 'Tag',                group: 'Primitives', load: () => import('./tag.demo.component').then(m => m.TagDemoComponent) },
  { id: 'thumb-box',          label: 'Thumb box',          group: 'Primitives', load: () => import('./thumb-box.demo.component').then(m => m.ThumbBoxDemoComponent) },

  // Shared components — shared spec §6
  { id: 'page-container',    label: 'Page container',    group: 'Shared', load: () => import('./page-container.demo.component').then(m => m.PageContainerDemoComponent) },
  { id: 'logo',              label: 'Logo',               group: 'Shared', load: () => import('./logo.demo.component').then(m => m.LogoDemoComponent) },
  { id: 'nav-buttons',       label: 'Nav buttons',        group: 'Shared', load: () => import('./nav-buttons.demo.component').then(m => m.NavButtonsDemoComponent) },
  { id: 'download-options',  label: 'Download options',   group: 'Shared', load: () => import('./download-options.demo.component').then(m => m.DownloadOptionsDemoComponent) },
  { id: 'media-thumbnail',   label: 'Media thumbnail',    group: 'Shared', load: () => import('./media-thumbnail.demo.component').then(m => m.MediaThumbnailDemoComponent) },
  { id: 'download-info',     label: 'Download info',      group: 'Shared', load: () => import('./download-info.demo.component').then(m => m.DownloadInfoDemoComponent) },
  { id: 'item-container',    label: 'Item container',     group: 'Shared', load: () => import('./item-container.demo.component').then(m => m.ItemContainerDemoComponent) },

  // Core (optional, not required by the shared spec's checklist, included for completeness)
  { id: 'nav-bar',           label: 'Nav bar',            group: 'Core', load: () => import('./nav-bar.demo.component').then(m => m.NavBarDemoComponent) },

  // Feature-local components — Project Tree's features/*/components/
  { id: 'url-bar',           label: 'Url bar (Home)',          group: 'Feature', load: () => import('./url-bar.demo.component').then(m => m.UrlBarDemoComponent) },
  { id: 'url-list',          label: 'Url list (Home)',         group: 'Feature', load: () => import('./url-list.demo.component').then(m => m.UrlListDemoComponent) },
  { id: 'file-name',         label: 'File name (Single)',      group: 'Feature', load: () => import('./file-name.demo.component').then(m => m.FileNameDemoComponent) },
  { id: 'toggle-panel',      label: 'Toggle panel (Single)',   group: 'Feature', load: () => import('./toggle-panel.demo.component').then(m => m.TogglePanelDemoComponent) },
  { id: 'frame-size',        label: 'Frame size (Single)',     group: 'Feature', load: () => import('./frame-size.demo.component').then(m => m.FrameSizeDemoComponent) },   // stub, §6
  { id: 'trim-video',        label: 'Trim video (Single)',     group: 'Feature', load: () => import('./trim-video.demo.component').then(m => m.TrimVideoDemoComponent) },
  { id: 'status-count',      label: 'Status count (Downloads)', group: 'Feature', load: () => import('./status-count.demo.component').then(m => m.StatusCountDemoComponent) },
  { id: 'search-bar',        label: 'Search bar (History)',    group: 'Feature', load: () => import('./search-bar.demo.component').then(m => m.SearchBarDemoComponent) },
];
```

---

## 3. `dev-shell.component`: sidebar + content

```ts
@Component({
  selector: 'd4m-dev-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dev-shell.component.html',
  styleUrl: './dev-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevShellComponent {
  protected readonly groups = GROUP_ORDER.map(g => ({
    name: g, entries: DEMO_ENTRIES.filter(e => e.group === g),
  }));
  protected theme = inject(ThemeService);
}
```

```html
<!-- dev-shell.component.html -->
<div class="dev">
  <nav class="dev__sidebar" aria-label="Component playground">
    @for (group of groups; track group.name) {
      <p class="dev__group-label">{{ group.name }}</p>
      @for (entry of group.entries; track entry.id) {
        <a class="dev__tab" [routerLink]="entry.id" routerLinkActive="on" [attr.aria-current]="null">{{ entry.label }}</a>
      }
    }
  </nav>
  <div class="dev__content">
    <div class="dev__toolbar">
      <button type="button" class="btn btn--icon" [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'" (click)="theme.toggle()">
        <d4m-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
      </button>
    </div>
    <router-outlet />
  </div>
</div>
```

```scss
// dev-shell.component.scss — tokens only, same rule as everything else
.dev { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; background: var(--color-bg); }
.dev__sidebar { padding: 20px 12px; border-right: 1px solid var(--color-border); overflow-y: auto; }
.dev__group-label { margin: 18px 0 6px; font-size: 12px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
.dev__tab { display: block; padding: 8px 10px; border-radius: var(--radius-icon-btn); color: var(--color-text); text-decoration: none; font-size: 14px; }
.dev__tab:hover { background: var(--color-selected); }
.dev__tab.on { background: var(--color-primary); color: var(--color-bg); }
.dev__content { padding: 24px 32px; overflow-y: auto; }
.dev__toolbar { display: flex; justify-content: flex-end; margin-bottom: 16px; position: sticky; top: 0; }
```

**Why a second theme toggle, when the real nav bar already has one:** the shell's own `<main>` wraps `/dev` the same as any other route, so the app's normal nav bar is already present above this page and its toggle already works here — but after scrolling down a long demo it's out of reach. The pinned toolbar toggle (`.dev__toolbar`, `position: sticky`) is a deliberate, intentional duplicate bound to the exact same `ThemeService`, purely for reviewer convenience; it is not a second theme mechanism.

**Why `routerLinkActive` and not a signal-based "selected tab" state:** using real child routes (rather than an `@switch` over a signal) means each tab has its own shareable URL (`/dev/checkbox`), browser back/forward works, and a reviewer can link a teammate straight to "look at the item-container problem" instead of "open /dev and click the sidebar."

---

## 4. The contract every demo component follows

A demo component is a thin, **dumb** wrapper (same rules as `shared/`, Core spec applies by extension) that:

1. Imports the **real** component it's demonstrating — never a visual mock-up of it.
2. Renders it once per state/variant already listed in that component's own spec section — nothing here invents new states; it only exercises what's already written. Example sources: shared spec §4.6.x per primitive, §6 per shared component, each page spec's own "States" table for feature-local components.
3. Wraps each instance in a small captioned box:

```html
<section class="demo__case">
  <p class="demo__caption">Indeterminate (select-all, partial)</p>
  <d4m-checkbox [value]="false" [indeterminate]="true" />
</section>
```

4. Uses real mock data where it exists (`MOCK_MEDIA_ITEMS`, `MOCK_DOWNLOADS`, `MOCK_HISTORY`, `MOCK_CATALOG` — Mock API Service Spec §4) rather than inventing fresh fixtures, so what a reviewer sees here matches what they'll see on the real pages.
5. States that can't be triggered by a prop alone (hover, focus, active/pressed-while-dragging) are **not faked** — the playground exists to check every state reachable through the public API, not every CSS pseudo-class. Leave a short inline comment (`<!-- hover/focus: check manually, not reproducible via inputs -->`) rather than hacking a fake `:hover` class onto an element.
6. Where a state needs interaction to reach (loading, then loaded; empty, then populated), the demo may include a small local-only toggle button to flip between them — this button is dev-only scaffolding and never ships.

**Worked example — `checkbox.demo.component.ts`:**

```ts
@Component({
  selector: 'd4m-checkbox-demo',
  imports: [CheckboxComponent],
  template: `
    <h2>Checkbox</h2>
    <section class="demo__case"><p class="demo__caption">Unchecked</p><d4m-checkbox [value]="false" /></section>
    <section class="demo__case"><p class="demo__caption">Checked</p><d4m-checkbox [value]="true" /></section>
    <section class="demo__case"><p class="demo__caption">Indeterminate</p><d4m-checkbox [value]="false" [indeterminate]="true" /></section>
    <section class="demo__case"><p class="demo__caption">Disabled, unchecked</p><d4m-checkbox [value]="false" [disabled]="true" /></section>
    <section class="demo__case"><p class="demo__caption">Disabled, checked</p><d4m-checkbox [value]="true" [disabled]="true" /></section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoComponent {}
```

**A heavier example — `item-container.demo.component.ts`** needs more than static markup because its states span counts, not just props: it should show the three live usages already written out in shared spec §6.7 (`pre-select` row, `download-info small` with a toolbar, `history` with `selectable=false`), plus the specific stress cases every container-consuming spec calls out: 5 visible rows with 9 items, 5 visible rows with 300 items (virtual-scroll smoothness check, Flow spec §6's `big` mock), and the genuinely-empty state (`[empty]` slot). This is the one demo component that's expected to be noticeably longer than the others — that's fine, it mirrors how much `item-container` itself is reused.

---

## 5. Done when

- [ ] Every entry in `DEMO_ENTRIES` (§2) has a working demo component; the list in §2 and the `demos/` folder (§1) always match 1:1.
- [ ] Switching sidebar tabs never reloads the whole page (child routes + `loadComponent`, same lazy pattern as the rest of the app).
- [ ] The pinned theme toggle flips every visible demo instance at once, and the choice persists across tab switches (shared `ThemeService`, no local state).
- [ ] Each primitive and shared component's demo covers every state/variant listed in its own spec section — this is literally the shared spec's own definition-of-done item (§9), so checking it off here should let a reviewer check it off there too.
- [ ] `item-container`'s demo includes the 300-item case and stays smooth (shared spec §6.7's own "done when").
- [ ] The whole `/dev` route tree is **absent from the production route table** (Routing spec §2, §8) — not just unreachable, actually excluded from the compiled bundle.
- [ ] `frame-size.demo.component.ts` exists as a visible placeholder ("Frame Size options not yet designed — see open gap") rather than being silently missing from the sidebar, so the gap stays visible instead of looking forgotten.

---

## 6. Choices made that you can change

1. **Sidebar driven by real child routes**, not a signal switch, so each component gets a bookmarkable, shareable URL. If you'd rather avoid the route-table overhead of ~25 child routes, a signal-based `@switch` over `DEMO_ENTRIES` works too — you'd lose shareable per-component links.
2. **Demo components live in one central `dev/demos/` folder**, not beside each real component. Centralizing makes "what's missing" a one-folder glance; co-locating (`shared/ui/checkbox/checkbox.demo.component.ts`) keeps each component's own folder self-contained instead. Either is fine; centralizing was chosen because this file set already treats cross-cutting concerns (routing, mocks) as their own folders.
3. **`nav-bar` is included as an optional "Core" group demo** even though the shared spec's own checklist (§9) only requires this for `shared/` components. Drop it if you don't think a standalone nav-bar demo adds anything beyond what's already visible in the shell itself.
4. **No fake hover/focus states.** If visual QA really needs to screenshot hover states without a mouse, that's a Storybook-style tool's job, not this one — out of scope here by design, not an oversight.
5. **`frame-size` ships as a stub entry** rather than being left out of the registry entirely, so the gap is visible in the tool meant to surface exactly this kind of gap (§5's last checklist item).
