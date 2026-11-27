import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TogglePanelComponent } from '@features/single/components/toggle-panel';

@Component({
  selector: 'd4m-toggle-panel-demo',
  imports: [TogglePanelComponent],
  template: `
    <h2>Toggle panel (Single)</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Collapsed (interactive)</figcaption>
        <d4m-toggle-panel label="Frame Size" [(open)]="open">
          <div expanded>Expanded content</div>
        </d4m-toggle-panel>
      </figure>
      <figure>
        <figcaption>Expanded</figcaption>
        <d4m-toggle-panel label="Trim Video" [open]="true">
          <div expanded>Expanded content</div>
        </d4m-toggle-panel>
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <d4m-toggle-panel label="Trim Video" [disabled]="true" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePanelDemoComponent {
  protected readonly open = signal(false);
}
