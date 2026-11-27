import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PageContainerSize = 'sm' | 'md' | 'lg';
export type PageContainerPadding = 'default' | 'split' | 'compact' | 'none';
export type PageContainerLayout = 'stack' | 'split';

@Component({
  selector: 'd4m-page-container',
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  readonly size = input<PageContainerSize>('md');
  readonly padding = input<PageContainerPadding>('default');
  readonly layout = input<PageContainerLayout>('stack');
}
