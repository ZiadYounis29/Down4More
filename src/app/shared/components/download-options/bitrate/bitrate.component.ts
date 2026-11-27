import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'd4m-bitrate',
  imports: [],
  templateUrl: './bitrate.component.html',
  styleUrl: './bitrate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BitrateComponent {
  readonly value = model<number | null>(null);
  readonly options = input<number[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectedIndex = computed(() => {
    const v = this.value();
    const idx = this.options().indexOf(v ?? -1);
    return idx >= 0 ? idx : -1;
  });

  protected onChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const idx = Number(sel.value);
    const opts = this.options();
    this.value.set(idx >= 0 && idx < opts.length ? opts[idx] : null);
  }
}
