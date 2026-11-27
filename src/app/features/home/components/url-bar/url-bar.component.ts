import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@shared/ui/icon';
import { NavButton, navFetch } from '@shared/components/nav-buttons';

@Component({
  selector: 'd4m-url-bar',
  templateUrl: './url-bar.component.html',
  styleUrl: './url-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
})
export class UrlBarComponent {
  readonly value = model<string>('');
  readonly error = input<string | null>(null);
  readonly loading = input<boolean>(false);
  readonly canFetch = input<boolean>(false);

  readonly add = output<void>();
  readonly fetch = output<void>();

  readonly fetchButton = computed<NavButton>(() => ({
    ...navFetch(),
    disabled: !this.canFetch(),
    loading: this.loading(),
  }));

  onAdd(): void {
    if (this.value().trim().length > 0 && !this.loading()) {
      this.add.emit();
    }
  }

  onFetch(): void {
    this.fetch.emit();
  }
}
