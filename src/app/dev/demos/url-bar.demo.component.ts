import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { UrlBarComponent } from '@features/home/components/url-bar';

@Component({
  selector: 'd4m-url-bar-demo',
  imports: [UrlBarComponent],
  template: `
    <h2>Url bar (Home)</h2>
    <section class="demo__case">
      <p class="demo__caption">Empty (plus and fetch disabled)</p>
      <d4m-url-bar [(value)]="emptyVal" [canFetch]="false" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">With text (last event: {{ lastEvent() }})</p>
      <d4m-url-bar
        [(value)]="textVal"
        [canFetch]="true"
        (add)="lastEvent.set('add')"
        (fetch)="lastEvent.set('fetch')"
      />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Error</p>
      <d4m-url-bar
        [value]="'bad link'"
        error="That doesn't look like a link."
        [canFetch]="true"
      />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Loading</p>
      <d4m-url-bar
        [value]="'https://youtube.com/watch?v=abc'"
        [loading]="true"
        [canFetch]="true"
      />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Fetch disabled (typing invalid/empty with no list)</p>
      <d4m-url-bar [value]="'https://youtube.com/watch?v=abc'" [canFetch]="false" />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlBarDemoComponent {
  protected readonly emptyVal = signal('');
  protected readonly textVal = signal('https://youtube.com/watch?v=dQw4w9WgXcQ');
  protected readonly lastEvent = signal('none');
}
