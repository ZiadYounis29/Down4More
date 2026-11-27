# Down4More: Core / Shell Spec

> **Scope:** `src/app/core/` and the app shell. Not shared components. Companion to `Down4More-Shared-Components-Spec.md`, whose tokens (section 4) and `d4m-logo` (6.2) this file uses.
> **Contents so far:** nav-bar, ThemeService, app shell. Still to come: `ApiService`, mock service, feature services, models, routing. **(rev 3)** Note: `DownloadService`, `FetchInfoService`, `ProgressService` and `HistoryService` are currently described inside the Flow, Home, Downloads and History specs, and should move here when this file grows.

---

## 1. `nav-bar` (`core/layout/`)

**Path:** `core/layout/nav-bar/` · **Selector:** `d4m-nav-bar` · **Used by:** `app.component` only (the shell)

It lives in `core` and not in `shared` because it knows the router and the theme. It follows the same style rules (tokens only, OnPush, signals) and uses `d4m-logo` from `shared`.

**Purpose:** the top bar on every page: logo (link home), the three main links, and the theme toggle.

**Look** (values from the designs, buttons 11 and 9 in section 4.5 of the shared spec):

| Part | Spec |
|---|---|
| Bar | flex, `align-items: center`, `justify-content: space-between`, **height 60**, `max-width: 1180`, `margin: 0 auto`, `padding: 0 8px` |
| Left | `d4m-logo` mark, **46 tall x 40 wide**, wrapped in `<a routerLink="/" aria-label="Down4More home">` |
| Right | flex, gap 8, items centred: three links, then the theme toggle |
| Link | padding `9px 16px`, radius 10, 15/600, colour `--color-text`, no underline. **Active:** fill `--color-primary`, text `--color-bg`. Hover (assumed): border-free tint `--color-selected` |
| Theme toggle | icon button 38 x 38 (`.btn--icon`), radius 10, `--box-border` / `--box-bg` / `--box-fg`. Icon 18. Light theme shows `moon` (switch to dark), dark theme shows `sun` (switch to light) |
| Compact (720px and narrower, `@include compact`) | link padding `8px 10px`, font 14, gap 4. The logo keeps 46 tall. **(rev 3)** This was a separate 560px rule: the app has one breakpoint (shared spec 4.4) |

**Behaviour**
- Links: **Downloads** `/downloads`, **History** `/history`, **Settings** `/settings`. The logo goes to `/` (Home). Home, Single and Playlist have **no** active link.
- The active link follows the route with `routerLinkActive="on"` and `ariaCurrentWhenActive="page"`. A route under `/downloads/...` keeps Downloads active (default prefix matching).
- The toggle calls `ThemeService.toggle()`. `aria-label` reads "Switch to dark theme" or "Switch to light theme" depending on the current theme.
- The bar is not sticky and has no badges in v1.

**API**

| Inputs | Type | Default | Notes |
|---|---|---|---|
| `items` | `NavItem[]` | `NAV_ITEMS` | `{ label: string; path: string }`. A page never changes it. It exists so a link is added by adding one object |

No outputs. Navigation and theme changes happen inside the component, which is allowed here because it is in `core`.

```ts
// nav-bar.component.ts
export interface NavItem { label: string; path: string; }
export const NAV_ITEMS: NavItem[] = [
  { label: 'Downloads', path: '/downloads' },
  { label: 'History',   path: '/history' },
  { label: 'Settings',  path: '/settings' },
];

@Component({
  selector: 'd4m-nav-bar',
  imports: [RouterLink, RouterLinkActive, LogoComponent, IconComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
  items = input<NavItem[]>(NAV_ITEMS);
  protected theme = inject(ThemeService);
  protected toggleLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
```

```html
<!-- nav-bar.component.html -->
<nav class="bar" aria-label="Main">
  <a class="bar__logo" routerLink="/" aria-label="Down4More home"><d4m-logo variant="mark" [height]="46" /></a>
  <div class="bar__right">
    @for (item of items(); track item.path) {
      <a class="nl" [routerLink]="item.path" routerLinkActive="on" ariaCurrentWhenActive="page">{{ item.label }}</a>
    }
    <button type="button" class="btn btn--icon" [attr.aria-label]="toggleLabel()" (click)="theme.toggle()">
      <d4m-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="18" />
    </button>
  </div>
</nav>
```

```scss
// nav-bar.component.scss  (tokens only)
.bar { display: flex; align-items: center; justify-content: space-between;
       height: 60px; max-width: 1180px; margin: 0 auto; padding: 0 8px; }
.bar__logo { display: inline-flex; }
.bar__right { display: flex; align-items: center; gap: 8px; }
.nl { padding: 9px 16px; border-radius: var(--radius-icon-btn); color: var(--color-text);
      text-decoration: none; font-weight: 600; font-size: 15px; }
.nl:hover { background: var(--color-selected); }
.nl.on { background: var(--color-primary); color: var(--color-bg); }
.nl:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
@include compact { .nl { padding: 8px 10px; font-size: 14px; } .bar__right { gap: 4px; } }
```

**`ThemeService`** (`core/services/theme.service.ts`). Only `nav-bar` calls it. The Settings page may use it later.

```ts
export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'd4m-theme';
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.dataset['theme'] = t;
      try { localStorage.setItem(this.KEY, t); } catch { /* private mode: ignore */ }
    });
  }
  toggle(): void { this.theme.update(t => (t === 'dark' ? 'light' : 'dark')); }

  private initial(): Theme {
    try { const s = localStorage.getItem(this.KEY); if (s === 'light' || s === 'dark') return s; } catch {}
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
```

**Shell (`app.component`)**: the nav bar and page spacing come from here, so pages never add their own top margin.

```html
<!-- app.component.html -->
<div class="shell">
  <d4m-nav-bar />
  <main class="shell__main"><router-outlet /></main>
</div>
```
```scss
.shell { min-height: 100vh; box-sizing: border-box; padding: 20px 32px 48px;
         background: var(--color-bg); color: var(--color-text); font-family: var(--font-body); }
.shell__main { margin-top: 28px; }            // gap between the bar and the page card
@include compact { .shell { padding: 16px 16px 32px; } }   // the mixin from styles/_breakpoints.scss, never a raw 720px
```

**States:** link default, hover, active, focus; toggle in light and dark; narrow screen. **⚙ Backend later:** nothing.

**Done when:** the logo link goes home; exactly one link is active on `/downloads`, `/history`, `/settings`; none is active on `/`; the toggle flips the whole app, survives a reload, and its icon and `aria-label` change; Tab reaches logo, links and toggle in that order with a visible focus ring; it looks identical to the designs in both themes.
