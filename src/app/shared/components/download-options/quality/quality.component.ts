import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

// d4m-select is on p2/t1-controls, not yet on main. Using native <select> stand-in.
// import { SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-quality',
  imports: [],
  templateUrl: './quality.component.html',
  styleUrl: './quality.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityComponent {
  readonly value = model<string | null>(null);
  readonly options = input<string[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectedIndex = computed(() => {
    const v = this.value();
    const idx = this.options().indexOf(v ?? '');
    return idx >= 0 ? idx : -1;
  });

  protected onChange(event: Event): void {
    const sel = event.target as HTMLSelectElement;
    const idx = Number(sel.value);
    const opts = this.options();
    this.value.set(idx >= 0 && idx < opts.length ? opts[idx] : null);
  }
}
