import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationService } from '@core/services/navigation.service';
import { ThemeService } from '@core/services/theme.service';
import { LogoComponent } from '@shared/components/logo';
import { IconComponent } from '@shared/ui/icon';

export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Downloads', path: '/downloads' },
  { label: 'History', path: '/history' },
  { label: 'Settings', path: '/settings' },
];

@Component({
  selector: 'd4m-nav-bar',
  imports: [RouterLink, RouterLinkActive, LogoComponent, IconComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarComponent {
  readonly items = input<NavItem[]>(NAV_ITEMS);
  private readonly router = inject(Router);
  private readonly nav = inject(NavigationService);
  protected readonly theme = inject(ThemeService);
  protected readonly toggleLabel = computed(() =>
    this.theme.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  protected onNavClick(item: NavItem, event: Event): void {
    const current = this.router.url.split('?')[0].split('#')[0] || '/';
    if (current === item.path) {
      event.preventDefault();
      this.nav.returnToFlow();
    }
  }
}
