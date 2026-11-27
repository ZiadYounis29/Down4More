import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavBarComponent } from '@core/layout/nav-bar';

@Component({
  selector: 'd4m-nav-bar-demo',
  imports: [NavBarComponent],
  template: `
    <h2>Nav bar</h2>
    <section class="demo__case">
      <p class="demo__caption">
        Real &lt;d4m-nav-bar /&gt; — active link follows the current route (hover/focus: check
        manually)
      </p>
      <d4m-nav-bar />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Compact (390px wrapper)</p>
      <div class="demo__compact-wrap">
        <d4m-nav-bar />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavBarDemoComponent {}
