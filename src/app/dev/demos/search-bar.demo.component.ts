import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SearchBarComponent } from '@features/history/components/search-bar';

/** Demo for d4m-search-bar — covers empty state, with value, long value. */
@Component({
  selector: 'd4m-search-bar-demo',
  templateUrl: './search-bar.demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBarComponent],
})
export class SearchBarDemoComponent {
  readonly emptyValue = signal('');
  readonly withValue = signal('Rocket landing');
  readonly longValue = signal('Morning run routine - A comprehensive guided morning run for beginners covering warm-up, interval training');
}
