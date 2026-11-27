import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TagComponent } from '@shared/ui/tag';

@Component({
  selector: 'd4m-tag-demo',
  imports: [TagComponent],
  template: `
    <h2>Tag</h2>
    <section class="demo__case">
      <p class="demo__caption">Default</p>
      <d4m-tag text="Default" variant="default" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Applied</p>
      <d4m-tag text="1080p · mp4" variant="applied" />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDemoComponent {}
