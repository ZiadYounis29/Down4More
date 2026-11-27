import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Option, SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-bitrate',
  imports: [SelectComponent],
  templateUrl: './bitrate.component.html',
  styleUrl: './bitrate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BitrateComponent {
  readonly value = model<number | null>(null);
  readonly options = input<number[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectOptions = computed<Option<number | null>[]>(() =>
    this.options().map((b) => ({ value: b, label: `${b} kbps` })),
  );
}
