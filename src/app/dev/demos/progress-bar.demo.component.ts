import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProgressBarComponent } from '@shared/ui/progress-bar';

@Component({
  selector: 'd4m-progress-bar-demo',
  imports: [ProgressBarComponent],
  template: `
    <h2>Progress bar</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>0%</figcaption>
        <d4m-progress-bar [value]="0" label="Progress 0%" />
      </figure>
      <figure>
        <figcaption>42%</figcaption>
        <d4m-progress-bar [value]="42" label="Progress 42%" />
      </figure>
      <figure>
        <figcaption>100%</figcaption>
        <d4m-progress-bar [value]="100" label="Progress 100%" />
      </figure>
      <figure>
        <figcaption>Processing</figcaption>
        <d4m-progress-bar [value]="100" variant="processing" label="Processing" />
      </figure>
      <figure>
        <figcaption>Clamped (-10 → 0, 150 → 100)</figcaption>
        <div style="display: grid; gap: 10px;">
          <d4m-progress-bar [value]="-10" label="Clamped low" />
          <d4m-progress-bar [value]="150" label="Clamped high" />
        </div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarDemoComponent {}
