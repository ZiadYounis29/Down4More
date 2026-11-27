import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThumbBoxComponent } from '@shared/ui/thumb-box';

@Component({
  selector: 'd4m-thumb-box-demo',
  imports: [ThumbBoxComponent],
  template: `
    <h2>Thumb box</h2>
    <section class="demo__case">
      <p class="demo__caption">Row (84x56, null src placeholder)</p>
      <d4m-thumb-box [src]="null" size="row" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Row (borderless, History style)</p>
      <d4m-thumb-box [src]="null" size="row" [bordered]="false" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Single (150x100)</p>
      <d4m-thumb-box [src]="null" size="single" />
    </section>
    <section class="demo__case">
      <p class="demo__caption">Preview (flex, min-height 120)</p>
      <div style="display: flex; width: 260px;">
        <d4m-thumb-box [src]="null" size="preview" />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbBoxDemoComponent {}
