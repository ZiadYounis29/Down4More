import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ItemTemplateContext, ItemTemplateDirective } from './item-template.directive';

@Component({
  selector: 'd4m-item-container',
  imports: [ScrollingModule, NgTemplateOutlet],
  templateUrl: './item-container.component.html',
  styleUrl: './item-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemContainerComponent<T> {
  readonly items = input.required<T[]>();
  readonly itemId = input<(item: T) => string>((item) => (item as { id: string }).id);
  readonly selectable = input(false);
  readonly singleSelect = input(false);
  readonly selectedIds = model<string[]>([]);
  readonly virtualScroll = input(true);
  readonly visibleRows = input(5);
  readonly compactRows = input<number | null>(null);
  readonly rowHeight = input(82);
  readonly rowGap = input(10);
  readonly heightMode = input<'fixed' | 'fit'>('fixed');
  readonly selectAllLabel = input('Select all');
  readonly noSelectionMeansAll = input(false);
  readonly summary = input<string | null>(null);

  readonly itemActivated = output<string>();
  readonly scrolledToEnd = output<void>();

  protected readonly itemTemplate = contentChild(ItemTemplateDirective);
  private readonly viewportRef = viewChild(CdkVirtualScrollViewport);
  private readonly plainListRef = viewChild<ElementRef<HTMLElement>>('plainList');
  private readonly railRef = viewChild<ElementRef<HTMLElement>>('rail');

  protected readonly scrollThumbTop = signal(0);
  protected readonly scrollThumbHeight = signal(0);
  protected readonly isScrollable = signal(false);
  protected readonly isDragging = signal(false);
  private readonly isCompact = signal(false);

  private dragStartY = 0;
  private dragStartScrollTop = 0;

  protected readonly itemSize = computed(() => this.rowHeight() + this.rowGap());

  protected readonly effectiveVisibleRows = computed(() => {
    const compact = this.compactRows();
    return this.isCompact() && compact !== null
      ? Math.min(this.visibleRows(), compact)
      : this.visibleRows();
  });

  protected readonly listHeight = computed(() => {
    const cap = this.effectiveVisibleRows();
    const rows =
      this.heightMode() === 'fit'
        ? Math.min(cap, Math.max(1, this.items().length))
        : cap;
    return rows * this.rowHeight() + Math.max(0, rows - 1) * this.rowGap() + 4;
  });

  protected readonly selectedSet = computed(() => new Set(this.selectedIds()));

  protected readonly allSelected = computed(() => {
    if (this.noSelectionMeansAll()) {
      return this.selectedIds().length === 0;
    }
    const list = this.items();
    if (list.length === 0) return false;
    const set = this.selectedSet();
    const idFn = this.itemId();
    return list.every((item) => set.has(idFn(item)));
  });

  protected readonly summaryText = computed(() => {
    const custom = this.summary();
    if (custom !== null) return custom;
    const list = this.items();
    const set = this.selectedSet();
    const idFn = this.itemId();
    const selectedCount = list.filter((item) => set.has(idFn(item))).length;
    return `${selectedCount} of ${list.length} selected`;
  });

  constructor() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(max-width: 720px)');
      this.isCompact.set(mq.matches);
      const onChange = (e: MediaQueryListEvent) => this.isCompact.set(e.matches);
      mq.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
    }

    effect(() => {
      const list = this.items();
      const idFn = this.itemId();
      const validIds = new Set(list.map((item) => idFn(item)));
      const current = untracked(() => this.selectedIds());
      const pruned = current.filter((id) => validIds.has(id));
      if (pruned.length !== current.length) {
        this.selectedIds.set(pruned);
      }
    });

    effect((onCleanup) => {
      const vp = this.viewportRef();
      const plain = this.plainListRef();
      this.items();
      this.listHeight();

      queueMicrotask(() => {
        vp?.checkViewportSize();
        this.syncScrollRail();
      });

      const el = vp?.elementRef.nativeElement ?? plain?.nativeElement;
      if (el && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.syncScrollRail());
        ro.observe(el);
        for (const child of Array.from(el.children)) {
          ro.observe(child);
        }
        onCleanup(() => ro.disconnect());
      }
    });
  }

  protected toggleSelectAll(): void {
    if (this.noSelectionMeansAll()) {
      this.selectedIds.set([]);
      return;
    }
    const list = this.items();
    const idFn = this.itemId();
    const visibleIds = list.map((item) => idFn(item));
    const visibleSet = new Set(visibleIds);

    if (this.allSelected()) {
      this.selectedIds.update((ids) => ids.filter((id) => !visibleSet.has(id)));
    } else {
      const existing = this.selectedIds().filter((id) => !visibleSet.has(id));
      this.selectedIds.set([...existing, ...visibleIds]);
    }
  }

  protected toggleItem(id: string): void {
    this.selectedIds.update((ids) => {
      if (ids.includes(id)) {
        return ids.filter((existing) => existing !== id);
      }
      if (this.singleSelect()) {
        return [id];
      }
      return [...ids, id];
    });
  }

  protected rowContext(item: T, index: number): ItemTemplateContext<T> {
    const id = this.itemId()(item);
    return {
      $implicit: item,
      selected: this.selectedSet().has(id),
      toggle: () => this.toggleItem(id),
      index,
    };
  }

  protected onScroll(): void {
    this.syncScrollRail();
    const el = this.scrollElement();
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
      this.scrolledToEnd.emit();
    }
  }

  protected onTrackClick(event: MouseEvent): void {
    const rail = this.railRef()?.nativeElement;
    const el = this.scrollElement();
    if (!rail || !el || !this.isScrollable()) return;
    const rect = rail.getBoundingClientRect();
    const clickY = event.clientY - rect.top - 6;
    const trackHeight = Math.max(1, rect.height - 12);
    const ratio = Math.min(1, Math.max(0, clickY / trackHeight));
    el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
  }

  protected onThumbPointerDown(event: PointerEvent): void {
    event.stopPropagation();
    const el = this.scrollElement();
    if (!el) return;
    this.isDragging.set(true);
    this.dragStartY = event.clientY;
    this.dragStartScrollTop = el.scrollTop;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected onThumbPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    const el = this.scrollElement();
    const rail = this.railRef()?.nativeElement;
    if (!el || !rail) return;
    const trackHeight = Math.max(1, rail.clientHeight - 12);
    const maxThumbTop = Math.max(1, trackHeight - this.scrollThumbHeight());
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight);
    const deltaY = event.clientY - this.dragStartY;
    el.scrollTop = this.dragStartScrollTop + (deltaY / maxThumbTop) * maxScroll;
  }

  protected onThumbPointerUp(event: PointerEvent): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  private scrollElement(): HTMLElement | null {
    const vp = this.viewportRef();
    if (vp) return vp.elementRef.nativeElement;
    return this.plainListRef()?.nativeElement ?? null;
  }

  private syncScrollRail(): void {
    const el = this.scrollElement();
    if (!el) {
      this.isScrollable.set(false);
      return;
    }
    const { scrollHeight, clientHeight, scrollTop } = el;
    if (scrollHeight <= clientHeight + 1) {
      this.isScrollable.set(false);
      return;
    }
    this.isScrollable.set(true);
    const trackHeight = Math.max(1, clientHeight - 12);
    const thumbH = Math.max(34, (trackHeight * clientHeight) / scrollHeight);
    const maxScroll = Math.max(1, scrollHeight - clientHeight);
    const maxTop = Math.max(0, trackHeight - thumbH);
    this.scrollThumbHeight.set(thumbH);
    this.scrollThumbTop.set((scrollTop / maxScroll) * maxTop);
  }
}
