import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '@shared/ui/icon';
import { NavButton } from './nav-buttons.presets';

export type NavButtonsSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'd4m-nav-buttons',
  imports: [IconComponent],
  templateUrl: './nav-buttons.component.html',
  styleUrl: './nav-buttons.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavButtonsComponent {
  readonly buttons = input.required<NavButton[]>();
  readonly size = input<NavButtonsSize>('md');
  readonly fullWidth = input<boolean | 'compact'>(false);
  readonly pressed = output<string>();

  protected readonly visibleButtons = computed(() => this.buttons().filter((b) => !b.hidden));
  protected readonly startButtons = computed(() =>
    this.visibleButtons().filter((b) => b.side === 'start'),
  );
  protected readonly endButtons = computed(() =>
    this.visibleButtons().filter((b) => b.side !== 'start'),
  );

  protected readonly iconSize = computed(() => {
    const s = this.size();
    return s === 'sm' ? 14 : s === 'lg' ? 22 : 20;
  });

  protected buttonClass(btn: NavButton): string {
    const variant = btn.variant ?? 'secondary';
    const sz = this.size();
    const classes = ['btn', `btn--${variant}`];
    if (sz === 'sm') classes.push('btn--sm');
    else if (sz === 'lg') classes.push('btn--lg');
    if (btn.loading) classes.push('btn--loading');
    if (this.fullWidth() === true) classes.push('btn--block');
    return classes.join(' ');
  }

  protected onClick(btn: NavButton): void {
    if (btn.disabled || btn.loading) return;
    this.pressed.emit(btn.id);
  }
}
