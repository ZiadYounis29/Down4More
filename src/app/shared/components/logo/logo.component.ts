import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type LogoVariant = 'mark' | 'wordmark';

@Component({
  selector: 'd4m-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  readonly variant = input<LogoVariant>('mark');
  readonly height = input<number | string>(46);
  readonly label = input('Down4More');

  protected readonly markHeight = computed(() =>
    this.variant() === 'wordmark'
      ? null
      : typeof this.height() === 'number'
        ? `${this.height()}px`
        : this.height(),
  );
}
