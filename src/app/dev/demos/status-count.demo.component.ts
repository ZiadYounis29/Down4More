import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { StatusCountComponent, StatusFilter } from '@features/downloads/components/status-count';

@Component({
  selector: 'd4m-status-count-demo',
  imports: [StatusCountComponent],
  template: `
    <h2>Status count (Downloads)</h2>
    <section class="demo__case">
      <p class="demo__caption">Interactive (current filter: {{ filter() ?? 'none' }})</p>
      <d4m-status-count [counts]="{ done: 4, downloading: 7, failed: 2 }" [(value)]="filter" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">999+ overflow cap</p>
      <d4m-status-count [counts]="{ done: 1200, downloading: 999, failed: 1005 }" [value]="'done'" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Compact (390px wrapper)</p>
      <div class="demo__compact-wrap">
        <d4m-status-count
          [counts]="{ done: 4, downloading: 7, failed: 2 }"
          [value]="'downloading'"
        />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCountDemoComponent {
  protected readonly filter = signal<StatusFilter | null>(null);
}
