import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { NavButton, NavButtonsComponent, navFetch } from '@shared/components/nav-buttons';
import { IconComponent } from '@shared/ui/icon';

@Component({
  selector: 'd4m-url-bar',
  imports: [IconComponent, NavButtonsComponent],
  templateUrl: './url-bar.component.html',
  styleUrl: './url-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlBarComponent {
  readonly value = model('');
  readonly error = input<string | null>(null);
  readonly loading = input(false);
  readonly canFetch = input(false);

  readonly add = output<void>();
  readonly fetch = output<void>();

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('linkInput');

  protected readonly plusDisabled = computed(
    () => this.value().trim().length === 0 || this.loading(),
  );

  protected readonly fetchButtons = computed<NavButton[]>(() => [
    { ...navFetch(), disabled: !this.canFetch(), loading: this.loading() },
  ]);

  focus(): void {
    this.inputEl()?.nativeElement.focus();
  }

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onEnter(event: Event): void {
    event.preventDefault();
    if (!this.plusDisabled()) {
      this.add.emit();
    }
  }

  protected onAdd(): void {
    if (!this.plusDisabled()) {
      this.add.emit();
    }
  }

  protected onFetch(): void {
    if (this.canFetch() && !this.loading()) {
      this.fetch.emit();
    }
  }
}
