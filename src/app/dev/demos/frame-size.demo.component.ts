import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { FrameSizeComponent } from '@features/single/components/frame-size';

@Component({
  selector: 'd4m-frame-size-demo',
  imports: [],
  template: `
    <h2>Frame size (Single)</h2>
    <p>Frame Size options not yet designed</p>
    <section class="demo-grid">
      <figure>
        <figcaption>Collapsed (interactive)</figcaption>
        <div>
          <span>Frame Size</span>
          <button
            type="button"
            role="switch"
            [attr.aria-checked]="open()"
            (click)="open.set(!open())"
          >
            {{ open() ? 'On' : 'Off' }}
          </button>
          @if (open()) {
            <div style="min-height: 200px; border: 2px dashed var(--color-border);">
              Frame size options go here
            </div>
          }
        </div>
      </figure>
      <figure>
        <figcaption>Expanded placeholder</figcaption>
        <div>
          <span>Frame Size</span>
          <button type="button" role="switch" aria-checked="true">On</button>
          <div style="min-height: 200px; border: 2px dashed var(--color-border);">
            Frame size options go here
          </div>
        </div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSizeDemoComponent {
  protected readonly open = signal(false);
}
