import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { IconComponent } from '@shared/ui/icon';
import { DEMO_ENTRIES, DemoEntry } from './demos/demo-registry';

const GROUP_ORDER: DemoEntry['group'][] = [
  'Primitives',
  'Shared',
  'Feature',
  'Core',
];

@Component({
  selector: 'd4m-dev-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  templateUrl: './dev-shell.component.html',
  styleUrl: './dev-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevShellComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly groups = GROUP_ORDER.map((g) => ({
    name: g,
    entries: DEMO_ENTRIES.filter((e) => e.group === g),
  }));
}
