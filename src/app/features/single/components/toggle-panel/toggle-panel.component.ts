import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';
// ToggleComponent lives on p2/t1-controls; not yet on main.
// Coded against the spec signature. Added to imports once T1 is merged.
// import { ToggleComponent } from '@shared/ui/toggle';

export type TogglePanelPadding = 'default' | 'roomy';

@Component({
  selector: 'd4m-toggle-panel',
  imports: [PanelComponent],
  templateUrl: './toggle-panel.component.html',
  styleUrl: './toggle-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePanelComponent {
  readonly label = input.required<string>();
  readonly open = model(false);
  readonly disabled = input(false);
  readonly padding = input<TogglePanelPadding>('default');

  protected toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
  }
}
