import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Option } from '../option.model';

@Component({
  selector: 'd4m-segmented-control',
  templateUrl: './segmented-control.component.html',
  styleUrl: './segmented-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent<T> {
  readonly value = model.required<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = input(false);
  readonly label = input('');

  protected select(option: Option<T>): void {
    if (this.disabled() || option.disabled) return;
    this.value.set(option.value);
  }
}
