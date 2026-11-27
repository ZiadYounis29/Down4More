import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FrameSizeComponent } from '@features/single/components/frame-size';

@Component({
  selector: 'd4m-frame-size-demo',
  imports: [FrameSizeComponent],
  template: `
    <h2>Frame size (Single)</h2>
    <p>Frame Size options not yet designed</p>
    <section class="demo-grid">
      <figure>
        <figcaption>Collapsed (interactive)</figcaption>
        <d4m-frame-size [(open)]="open" />
      </figure>
      <figure>
        <figcaption>Expanded placeholder</figcaption>
        <d4m-frame-size [open]="true" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSizeDemoComponent {
  protected readonly open = signal(false);
}
