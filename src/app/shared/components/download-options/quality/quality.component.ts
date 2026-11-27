import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Option, SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-quality',
  imports: [SelectComponent],
  templateUrl: './quality.component.html',
  styleUrl: './quality.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QualityComponent {
  readonly value = model<string | null>(null);
  readonly options = input<string[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectOptions = computed<Option<string | null>[]>(() =>
    this.options().map((o) => ({ value: o, label: o })),
  );
}
