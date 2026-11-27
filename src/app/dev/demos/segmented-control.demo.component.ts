import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
// UNRESOLVED IMPORT (not yet on main):
// import { SegmentedControlComponent } from '@shared/ui/segmented-control';

@Component({
  selector: 'd4m-segmented-control-demo',
  imports: [],
  template: `
    <h2>Segmented control</h2>
    <section class="demo-grid">
      @for (opt of options; track opt) {
        <figure>
          <figcaption>Selected: {{ opt }}</figcaption>
          <div role="group">
            @for (item of options; track item) {
              <button
                type="button"
                [attr.aria-pressed]="selected() === item"
                (click)="selected.set(item)"
              >
                {{ item }}
              </button>
            }
          </div>
        </figure>
      }
      <figure>
        <figcaption>Disabled</figcaption>
        <div role="group">
          @for (item of options; track item) {
            <button type="button" disabled [attr.aria-pressed]="item === 'video+audio'">
              {{ item }}
            </button>
          }
        </div>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlDemoComponent {
  protected readonly options = ['video+audio', 'audio only', 'video only'] as const;
  protected readonly selected = signal<string>('video+audio');
}
