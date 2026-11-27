import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageContainerComponent } from '@shared/components/page-container';

@Component({
  selector: 'd4m-page-container-demo',
  imports: [PageContainerComponent],
  template: `
    <h2>Page container</h2>
    <section class="demo__case">
      <p class="demo__caption">size="sm" (640px)</p>
      <d4m-page-container size="sm"><p style="margin: 0;">Small card content</p></d4m-page-container>
    </section>
    <section class="demo__case">
      <p class="demo__caption">size="md" (920px) with [header] and [footer]</p>
      <d4m-page-container size="md">
        <p header style="margin: 0 0 12px; color: var(--color-text-muted);">Header slot</p>
        <p style="margin: 0;">Default body slot</p>
        <p footer style="margin: 12px 0 0; color: var(--color-text-muted);">Footer slot</p>
      </d4m-page-container>
    </section>
    <section class="demo__case">
      <p class="demo__caption">size="lg" padding="split" layout="split"</p>
      <d4m-page-container size="lg" padding="split" layout="split">
        <div main style="padding: 12px; border: 1px dashed var(--color-border);">[main] column</div>
        <div side style="padding: 12px; border: 1px dashed var(--color-border);">[side] column</div>
      </d4m-page-container>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerDemoComponent {}
