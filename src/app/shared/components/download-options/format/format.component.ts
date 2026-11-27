import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'd4m-format',
  imports: [],
  templateUrl: './format.component.html',
  styleUrl: './format.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormatComponent {
  readonly value = model('');
  readonly options = input<string[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectedIndex = computed(() => {
    const idx = this.options().indexOf(this.value());
    return idx >= 0 ? idx : 0;
  });

  protected onChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const idx = Number(sel.value);
    const opts = this.options();
    if (idx >= 0 && idx < opts.length) this.value.set(opts[idx]);
  }
}
