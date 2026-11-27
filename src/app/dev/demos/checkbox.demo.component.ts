import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CheckboxComponent } from '@shared/ui/checkbox';

@Component({
  selector: 'd4m-checkbox-demo',
  imports: [CheckboxComponent],
  template: `
    <h2>Checkbox</h2>
    <section class="demo__case">
      <p class="demo__caption">Unchecked</p>
      <d4m-checkbox [value]="false" label="Unchecked" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Checked</p>
      <d4m-checkbox [value]="true" label="Checked" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Indeterminate</p>
      <d4m-checkbox [value]="false" [indeterminate]="true" label="Indeterminate" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Disabled, unchecked</p>
      <d4m-checkbox [value]="false" [disabled]="true" label="Disabled unchecked" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Disabled, checked</p>
      <d4m-checkbox [value]="true" [disabled]="true" label="Disabled checked" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Interactive (value: {{ interactive() }})</p>
      <d4m-checkbox [(value)]="interactive" label="Interactive checkbox" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Presentational (non-interactive span)</p>
      <d4m-checkbox [value]="true" [presentational]="true" />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDemoComponent {
  protected readonly interactive = signal(false);
}
