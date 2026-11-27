import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'd4m-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent {
  readonly label = input<string>();
  readonly padding = input<'default' | 'roomy'>('default');
}
