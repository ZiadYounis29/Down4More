import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressBarVariant = 'default' | 'processing';

@Component({
  selector: 'd4m-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  readonly value = input<number>(0);
  readonly variant = input<ProgressBarVariant>('default');
  readonly label = input('');

  protected readonly clampedValue = computed(() => {
    const raw = this.value();
    if (!Number.isFinite(raw)) return 0;
    return Math.min(100, Math.max(0, raw));
  });
}
