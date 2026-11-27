import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent, IconName } from '@shared/ui/icon';

const ICON_NAMES: IconName[] = [
  'plus',
  'x',
  'pause',
  'play',
  'check',
  'retry',
  'arrow-down',
  'arrow-up',
  'chevron-left',
  'chevron-right',
  'trash',
  'warning',
  'moon',
  'sun',
  'search',
];

@Component({
  selector: 'd4m-icon-demo',
  imports: [IconComponent],
  template: `
    <h2>Icon</h2>
    @for (size of sizes; track size) {
      <section class="demo__case">
        <p class="demo__caption">All 15 icons at {{ size }}px</p>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
          @for (name of icons; track name) {
            <span style="display: inline-flex; flex-direction: column; align-items: center; gap: 4px;">
              <d4m-icon [name]="name" [size]="size" />
              <small style="font-size: 11px; color: var(--color-text-muted);">{{ name }}</small>
            </span>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconDemoComponent {
  protected readonly icons = ICON_NAMES;
  protected readonly sizes = [14, 18, 26];
}
