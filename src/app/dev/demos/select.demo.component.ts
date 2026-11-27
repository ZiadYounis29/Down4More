import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { SelectComponent } from '@shared/ui/select';

@Component({
  selector: 'd4m-select-demo',
  imports: [],
  template: `
    <h2>Select</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Default</figcaption>
        <select [value]="val()" (change)="val.set($any($event.target).value)">
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
        </select>
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <select disabled>
          <option value="1080p">1080p</option>
        </select>
      </figure>
      <figure>
        <figcaption>Long label</figcaption>
        <select>
          <option value="long">2160p Ultra High Definition (4K HDR 60fps)</option>
        </select>
      </figure>
      <figure>
        <figcaption>Numeric values</figcaption>
        <select [value]="numVal()" (change)="numVal.set(+$any($event.target).value)">
          <option value="96">96 kbps</option>
          <option value="192">192 kbps</option>
          <option value="320">320 kbps</option>
        </select>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectDemoComponent {
  protected readonly val = signal('1080p');
  protected readonly numVal = signal(192);
}
