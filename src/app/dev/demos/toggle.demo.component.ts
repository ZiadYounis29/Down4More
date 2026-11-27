import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { ToggleComponent } from '@shared/ui/toggle';

@Component({
  selector: 'd4m-toggle-demo',
  imports: [],
  template: `
    <h2>Toggle</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Off (interactive)</figcaption>
        <button
          type="button"
          role="switch"
          [attr.aria-checked]="offState()"
          (click)="offState.set(!offState())"
        >
          {{ offState() ? 'On' : 'Off' }}
        </button>
      </figure>
      <figure>
        <figcaption>On</figcaption>
        <button type="button" role="switch" aria-checked="true">On</button>
      </figure>
      <figure>
        <figcaption>Disabled</figcaption>
        <button type="button" role="switch" aria-checked="false" disabled>Off</button>
      </figure>
      <figure>
        <figcaption>With aria-expanded</figcaption>
        <button
          type="button"
          role="switch"
          [attr.aria-checked]="expanded()"
          [attr.aria-expanded]="expanded()"
          (click)="expanded.set(!expanded())"
        >
          {{ expanded() ? 'On' : 'Off' }}
        </button>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleDemoComponent {
  protected readonly offState = signal(false);
  protected readonly expanded = signal(true);
}
