import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LogoComponent } from '@shared/components/logo';

@Component({
  selector: 'd4m-logo-demo',
  imports: [LogoComponent],
  template: `
    <h2>Logo</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Mark at 46px</figcaption>
        <d4m-logo variant="mark" [height]="46" />
      </figure>
      <figure>
        <figcaption>Wordmark (16px, 24px, 36px)</figcaption>
        <div style="display: grid; gap: 12px;">
          <div style="font-size: 16px;"><d4m-logo variant="wordmark" /></div>
          <div style="font-size: 24px;"><d4m-logo variant="wordmark" /></div>
          <div style="font-size: 36px;"><d4m-logo variant="wordmark" /></div>
        </div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoDemoComponent {}
