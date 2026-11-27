import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IconComponent } from '@shared/ui/icon';

@Component({
  selector: 'd4m-checkbox',
  imports: [IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly value = model(false);
  readonly indeterminate = input(false);
  readonly disabled = input(false);
  readonly label = input('');
  readonly presentational = input(false);

  protected toggle(): void {
    if (this.disabled()) return;
    this.value.update((v) => !v);
  }
}
