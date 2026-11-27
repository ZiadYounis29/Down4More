import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  model,
  viewChild,
} from '@angular/core';
import { Option } from '../option.model';

@Component({
  selector: 'd4m-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T extends string | number | null> {
  readonly value = model.required<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = input(false);
  readonly label = input('');

  private readonly selectEl = viewChild.required<ElementRef<HTMLSelectElement>>('selectEl');

  protected readonly selectedIndex = computed(() =>
    this.options().findIndex((option) => option.value === this.value()),
  );

  constructor() {
    afterRenderEffect(() => {
      const idx = this.selectedIndex();
      this.options();
      this.selectEl().nativeElement.selectedIndex = idx;
    });
  }

  protected onSelectionChange(event: Event): void {
    if (this.disabled()) return;
    const selectEl = event.target as HTMLSelectElement;
    const index = Number(selectEl.value);
    const option = this.options()[index];
    if (option && !option.disabled) {
      this.value.set(option.value);
    }
  }
}
