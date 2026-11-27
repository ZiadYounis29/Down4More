import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@shared/ui/icon';

@Component({
  selector: 'd4m-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
})
export class SearchBarComponent {
  readonly value = model('');
  readonly placeholder = input('enter a name…');
  readonly label = input('Search history');

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  /** Public method so the page can focus the search box after Retry/Remove. */
  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.value.set('');
    }
  }
}
