import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';
import type { MediaMode } from '@core/models';

// d4m-segmented-control is on p2/t1-controls, not yet on main.
// Native <div role="group"> + <button class="pill"> stand-ins used until T1 merges.
// import { SegmentedControlComponent } from '@shared/ui/segmented-control';

const MODE_OPTIONS: { value: MediaMode; label: string }[] = [
  { value: 'video+audio', label: 'video+audio' },
  { value: 'audio-only', label: 'audio only' },
  { value: 'video-only', label: 'video only' },
];

@Component({
  selector: 'd4m-video-audio-select',
  imports: [PanelComponent],
  templateUrl: './video-audio-select.component.html',
  styleUrl: './video-audio-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoAudioSelectComponent {
  readonly value = model.required<MediaMode>();
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly options = MODE_OPTIONS;

  protected select(v: MediaMode): void {
    if (this.disabled()) return;
    this.value.set(v);
  }
}
