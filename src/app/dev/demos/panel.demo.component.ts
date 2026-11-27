import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';

@Component({
  selector: 'd4m-panel-demo',
  imports: [PanelComponent],
  template: `
    <h2>Panel</h2>
    <section class="demo__case">
      <p class="demo__caption">Default padding, no label</p>
      <d4m-panel><p style="margin: 0;">Panel content inside default padding.</p></d4m-panel>
    </section>
    <section class="demo__case">
      <p class="demo__caption">With label</p>
      <d4m-panel label="Quality"><p style="margin: 0;">Labelled panel content.</p></d4m-panel>
    </section>
    <section class="demo__case">
      <p class="demo__caption">Roomy padding (20px 24px)</p>
      <d4m-panel label="Trim Video" padding="roomy">
        <p style="margin: 0;">Roomy panel content.</p>
      </d4m-panel>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelDemoComponent {}
