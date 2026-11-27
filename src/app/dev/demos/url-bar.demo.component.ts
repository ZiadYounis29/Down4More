// STUB owned by P4: overwritten with the real demo (P4 T6).
// Unresolved import chain: d4m-url-bar imports @shared/components/nav-buttons (owned by P5 T2, not on main yet).
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrlBarComponent } from '../features/home/components/url-bar/url-bar.component';

@Component({
  selector: 'd4m-url-bar-demo',
  template: `
    <h2>Url bar (Home)</h2>

    <div class="demo__case">
      <h3>Empty</h3>
      <d4m-url-bar />
    </div>

    <div class="demo__case">
      <h3>With text</h3>
      <d4m-url-bar [(value)]="withText" />
    </div>

    <div class="demo__case">
      <h3>Error</h3>
      <d4m-url-bar [(value)]="withText" error="That doesn't look like a link." />
    </div>

    <div class="demo__case">
      <h3>Loading</h3>
      <d4m-url-bar [(value)]="withText" [loading]="true" />
    </div>

    <div class="demo__case">
      <h3>Fetch disabled</h3>
      <d4m-url-bar [(value)]="withText" [canFetch]="false" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UrlBarComponent],
})
export class UrlBarDemoComponent {
  protected readonly withText = model('https://youtube.com/watch?v=abc');
}
