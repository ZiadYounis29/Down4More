import { ChangeDetectionStrategy, Component } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { ProgressBarComponent } from '@shared/ui/progress-bar';

@Component({
  selector: 'd4m-progress-bar-demo',
  imports: [],
  template: `
    <h2>Progress bar</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>0%</figcaption>
        <div role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
      </figure>
      <figure>
        <figcaption>42%</figcaption>
        <div role="progressbar" aria-valuenow="42" aria-valuemin="0" aria-valuemax="100">42%</div>
      </figure>
      <figure>
        <figcaption>100%</figcaption>
        <div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
      </figure>
      <figure>
        <figcaption>Processing</figcaption>
        <div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
          Processing (65%)
        </div>
      </figure>
      <figure>
        <figcaption>Clamped (-10 → 0, 150 → 100)</figcaption>
        <div role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
        <div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarDemoComponent {}
