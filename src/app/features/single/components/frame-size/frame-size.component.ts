import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { TogglePanelComponent } from '../toggle-panel';

@Component({
  selector: 'd4m-frame-size',
  imports: [TogglePanelComponent],
  templateUrl: './frame-size.component.html',
  styleUrl: './frame-size.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSizeComponent {
  readonly open = model(false);
}
