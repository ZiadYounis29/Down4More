import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Option } from '../option.model';

@Component({
  selector: 'd4m-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class SelectComponent<T extends string | number | null> {
  readonly value = model.required<T>();
  readonly options = input.required<Option<T>[]>();
  readonly disabled = input(false);
  readonly label = input('');

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly selectEl = viewChild.required<ElementRef<HTMLSelectElement>>('selectEl');

  protected readonly menuOpen = signal(false);

  protected readonly selectedIndex = computed(() =>
    this.options().findIndex((option) => option.value === this.value()),
  );

  protected readonly selectedLabel = computed(() => {
    const idx = this.selectedIndex();
    return idx >= 0 ? this.options()[idx].label : '';
  });

  constructor() {
    afterRenderEffect(() => {
      const idx = this.selectedIndex();
      this.options();
      this.selectEl().nativeElement.selectedIndex = idx;
    });
  }

  protected toggleMenu(): void {
    if (this.disabled()) return;
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected choose(index: number): void {
    if (this.disabled()) return;
    const option = this.options()[index];
    if (option && !option.disabled) {
      this.value.set(option.value);
      this.menuOpen.set(false);
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;
    if (!this.hostEl.nativeElement.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
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
