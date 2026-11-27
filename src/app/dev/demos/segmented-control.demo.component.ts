import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Option, SegmentedControlComponent } from '@shared/ui/segmented-control';

@Component({
  selector: 'd4m-segmented-control-demo',
  imports: [SegmentedControlComponent],
  template: `
    <h2>Segmented control</h2>
    <section class="demo-grid">
      @for (opt of options; track opt.value) {
        <figure>
          <figcaption>Selected: {{ opt.label }}</figcaption>
          <d4m-segmented-control
            [value]="opt.value"
            [options]="options"
            [label]="'Mode ' + opt.label"
          />
        </figure>
      }
      <figure>
        <figcaption>Interactive</figcaption>
        <d4m-segmented-control
          [(value)]="selected"
          [options]="options"
          label="Interactive mode"
        />
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <d4m-segmented-control
          [value]="'video+audio'"
          [options]="options"
          [disabled]="true"
          label="Disabled mode"
        />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlDemoComponent {
  protected readonly options: Option<string>[] = [
    { value: 'video+audio', label: 'video+audio' },
    { value: 'audio-only', label: 'audio only' },
    { value: 'video-only', label: 'video only' },
  ];
  protected readonly selected = signal<string>('video+audio');
}
