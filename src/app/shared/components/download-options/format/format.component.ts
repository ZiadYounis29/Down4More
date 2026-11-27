import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Option, SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-format',
  imports: [SelectComponent],
  templateUrl: './format.component.html',
  styleUrl: './format.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormatComponent {
  readonly value = model('');
  readonly options = input<string[]>([]);
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly selectOptions = computed<Option<string>[]>(() =>
    this.options().map((o) => ({ value: o, label: o })),
  );
}
