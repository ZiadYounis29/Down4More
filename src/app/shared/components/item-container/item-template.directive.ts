import { Directive, TemplateRef, inject, input } from '@angular/core';

export interface ItemTemplateContext<T> {
  $implicit: T;
  selected: boolean;
  toggle: () => void;
  index: number;
}

@Directive({
  selector: 'ng-template[d4mItem]',
})
export class ItemTemplateDirective<T = unknown> {
  readonly d4mItemFor = input<T[] | undefined>(undefined);
  readonly templateRef = inject<TemplateRef<ItemTemplateContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: ItemTemplateDirective<T>,
    ctx: unknown,
  ): ctx is ItemTemplateContext<T> {
    return true;
  }
}
