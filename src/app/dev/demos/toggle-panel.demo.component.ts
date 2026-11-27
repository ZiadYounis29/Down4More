import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { TogglePanelComponent } from '@features/single/components/toggle-panel';

@Component({
  selector: 'd4m-toggle-panel-demo',
  imports: [],
  template: `
    <h2>Toggle panel (Single)</h2>
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
            <div>Expanded content</div>
          }
        </div>
      </figure>
      <figure>
        <figcaption>Expanded</figcaption>
        <div>
          <span>Trim Video</span>
          <button type="button" role="switch" aria-checked="true">On</button>
          <div>Expanded content</div>
        </div>
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <div style="opacity: 0.38">
          <span>Trim Video</span>
          <button type="button" role="switch" aria-checked="false" disabled>Off</button>
        </div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePanelDemoComponent {
  protected readonly open = signal(false);
}
