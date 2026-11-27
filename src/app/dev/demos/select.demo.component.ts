import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Option, SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-select-demo',
  imports: [SelectComponent],
  template: `
    <h2>Select</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Default</figcaption>
        <d4m-select [(value)]="val" [options]="qualityOptions" label="Quality" />
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <d4m-select [value]="'1080p'" [options]="qualityOptions" [disabled]="true" label="Disabled quality" />
      </figure>
      <figure>
        <figcaption>Long label</figcaption>
        <d4m-select [(value)]="longVal" [options]="longOptions" label="Long option" />
      </figure>
      <figure>
        <figcaption>Numeric values</figcaption>
        <d4m-select [(value)]="numVal" [options]="bitrateOptions" label="Bitrate" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  protected readonly qualityOptions: Option<string>[] = [
    { value: '1080p', label: '1080p' },
    { value: '720p', label: '720p' },
    { value: '480p', label: '480p' },
  ];
  protected readonly longOptions: Option<string>[] = [
    { value: 'long', label: '2160p Ultra High Definition (4K HDR 60fps)' },
  ];
  protected readonly bitrateOptions: Option<number>[] = [
    { value: 96, label: '96 kbps' },
    { value: 192, label: '192 kbps' },
    { value: 320, label: '320 kbps' },
  ];

  protected readonly val = signal('1080p');
  protected readonly longVal = signal('long');
  protected readonly numVal = signal(192);
}
