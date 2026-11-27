import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UrlListComponent } from '@features/home/components/url-list';
import { UrlEntry } from '@features/home/url-entry.model';

const makeEntries = (n: number): UrlEntry[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `demo-${i + 1}`,
    url: `https://youtube.com/watch?v=video_${i + 1}`,
    key: `https://youtube.com/watch?v=video_${i + 1}`,
    kind: i % 3 === 1 ? 'playlist' : i % 3 === 2 ? 'unknown' : 'video',
  }));

@Component({
  selector: 'd4m-url-list-demo',
  imports: [UrlListComponent],
  template: `
    <h2>Url list (Home)</h2>
    <section class="demo__case">
      <p class="demo__caption">1 link</p>
      <d4m-url-list [entries]="one" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">3 links (one column)</p>
      <d4m-url-list [entries]="three" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">4 links (two columns start)</p>
      <d4m-url-list [entries]="four" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">7 links</p>
      <d4m-url-list [entries]="seven" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">50 links</p>
      <d4m-url-list [entries]="fifty" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Very long URL, failed row, and disabled</p>
      <d4m-url-list [entries]="edgeEntries" [disabled]="true" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Compact (390px wrapper)</p>
      <div class="demo__compact-wrap">
        <d4m-url-list [entries]="four" />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlListDemoComponent {
  protected readonly one = makeEntries(1);
  protected readonly three = makeEntries(3);
  protected readonly four = makeEntries(4);
  protected readonly seven = makeEntries(7);
  protected readonly fifty = makeEntries(50);
  protected readonly edgeEntries: UrlEntry[] = [
    {
      id: 'long-1',
      url: 'https://youtube.com/watch?v=very_long_id&extra=some_really_long_query_string_parameter_that_overflows_the_row_width_cleanly',
      key: 'long-1',
      kind: 'video',
    },
    {
      id: 'fail-1',
      url: 'https://example.com/fail',
      key: 'fail-1',
      kind: 'unknown',
      failed: true,
    },
  ];
}
