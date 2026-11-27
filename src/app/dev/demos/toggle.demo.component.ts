import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ToggleComponent } from '@shared/ui/toggle';

@Component({
  selector: 'd4m-toggle-demo',
  imports: [ToggleComponent],
  template: `
    <h2>Toggle</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Off (interactive)</figcaption>
        <d4m-toggle [(value)]="offState" label="Interactive toggle" />
      </figure>
      <figure>
        <figcaption>On</figcaption>
        <d4m-toggle [value]="true" label="On toggle" />
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <d4m-toggle [value]="false" [disabled]="true" label="Disabled toggle" />
      </figure>
      <figure>
        <figcaption>With aria-expanded</figcaption>
        <d4m-toggle [(value)]="expanded" [expanded]="expanded()" label="Expandable toggle" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDemoComponent {
  protected readonly offState = signal(false);
  protected readonly expanded = signal(true);
}
