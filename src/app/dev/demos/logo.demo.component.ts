import { ChangeDetectionStrategy, Component } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { LogoComponent } from '@shared/components/logo';

@Component({
  selector: 'd4m-logo-demo',
  imports: [],
  template: `
    <h2>Logo</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Mark at 46px</figcaption>
        <span aria-label="Down4More" style="font-size: 46px; font-weight: 700;">D4M</span>
      </figure>
      <figure>
        <figcaption>Wordmark (16px, 24px, 36px)</figcaption>
        <div style="font-size: 16px; font-weight: 700;">Down4More</div>
        <div style="font-size: 24px; font-weight: 700;">Down4More</div>
        <div style="font-size: 36px; font-weight: 700;">Down4More</div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoDemoComponent {}
