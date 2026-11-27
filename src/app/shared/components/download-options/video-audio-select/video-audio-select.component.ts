import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { MediaMode } from '@core/models';
import { Option, SegmentedControlComponent } from '@shared/ui/segmented-control';

const MODE_OPTIONS: Option<MediaMode>[] = [
  { value: 'video+audio', label: 'video+audio' },
  { value: 'audio-only', label: 'audio only' },
  { value: 'video-only', label: 'video only' },
];

@Component({
  selector: 'd4m-video-audio-select',
  imports: [SegmentedControlComponent],
  templateUrl: './video-audio-select.component.html',
  styleUrl: './video-audio-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoAudioSelectComponent {
  readonly value = model.required<MediaMode>();
  readonly disabled = input(false);
  readonly label = input('');

  protected readonly options = MODE_OPTIONS;
}
