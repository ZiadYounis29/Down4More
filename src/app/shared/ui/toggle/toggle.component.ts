import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

@Component({
  selector: 'd4m-toggle',
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent {
  readonly value = model(false);
  readonly disabled = input(false);
  readonly label = input('');
  readonly showText = input(true);
  readonly expanded = input<boolean | null>(null);

  protected toggle(): void {
    if (this.disabled()) return;
    this.value.update((v) => !v);
  }
}
