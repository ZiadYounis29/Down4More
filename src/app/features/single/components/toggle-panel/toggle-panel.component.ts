import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';
import { ToggleComponent } from '@shared/ui/toggle';

export type TogglePanelPadding = 'default' | 'roomy';

@Component({
  selector: 'd4m-toggle-panel',
  imports: [PanelComponent, ToggleComponent],
  templateUrl: './toggle-panel.component.html',
  styleUrl: './toggle-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePanelComponent {
  readonly label = input.required<string>();
  readonly open = model(false);
  readonly disabled = input(false);
  readonly padding = input<TogglePanelPadding>('default');
}
