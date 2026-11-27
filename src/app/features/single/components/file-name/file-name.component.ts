import { ChangeDetectionStrategy, Component, computed, model, input } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';

@Component({
  selector: 'd4m-file-name',
  imports: [PanelComponent],
  templateUrl: './file-name.component.html',
  styleUrl: './file-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileNameComponent {
  readonly value = model('');
  readonly extension = input('');
  readonly fallback = input('');

  protected readonly inputId = 'fn-' + Math.random().toString(36).slice(2, 8);

  protected readonly placeholder = computed(() => this.fallback());

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
