import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ItemContainerComponent } from './item-container.component';
import { ItemTemplateDirective } from './item-template.directive';

interface TestItem {
  id: string;
  title: string;
}

@Component({
  imports: [ItemContainerComponent, ItemTemplateDirective],
  template: `
    <d4m-item-container
      [items]="items()"
      [selectable]="selectable()"
      [singleSelect]="singleSelect()"
      [(selectedIds)]="selectedIds"
      [visibleRows]="visibleRows()"
      [compactRows]="compactRows()"
      [virtualScroll]="virtualScroll()"
      [noSelectionMeansAll]="noSelectionMeansAll()"
      [summary]="summary()"
    >
      <ng-template d4mItem [d4mItemFor]="items()" let-item let-sel="selected" let-toggle="toggle">
        <button type="button" class="test-row" [attr.data-id]="item.id" (click)="toggle()">
          {{ item.title }} ({{ sel ? 'on' : 'off' }})
        </button>
      </ng-template>
      <p empty class="empty-msg">Nothing here</p>
    </d4m-item-container>
  `,
})
class TestHostComponent {
  readonly items = signal<TestItem[]>([
    { id: '1', title: 'One' },
    { id: '2', title: 'Two' },
    { id: '3', title: 'Three' },
  ]);
  readonly selectable = signal(true);
  readonly singleSelect = signal(false);
  readonly selectedIds = signal<string[]>([]);
  readonly visibleRows = signal(5);
  readonly compactRows = signal<number | null>(null);
  readonly virtualScroll = signal(false);
  readonly noSelectionMeansAll = signal(false);
  readonly summary = signal<string | null>(null);
}

describe('ItemContainerComponent', () => {
  it('computes height for visibleRows 3, 5, and 8', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.visibleRows.set(3);
    fixture.detectChanges();
    let body = fixture.nativeElement.querySelector('.body') as HTMLElement;
    expect(body.style.height).toBe('270px'); // 3*82 + 2*10 + 4

    fixture.componentInstance.visibleRows.set(5);
    fixture.detectChanges();
    body = fixture.nativeElement.querySelector('.body') as HTMLElement;
    expect(body.style.height).toBe('454px');

    fixture.componentInstance.visibleRows.set(8);
    fixture.detectChanges();
    body = fixture.nativeElement.querySelector('.body') as HTMLElement;
    expect(body.style.height).toBe('730px'); // 8*82 + 7*10 + 4
  });

  it('caps visible rows to compactRows when set in phone/compact mode', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia;

    try {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.componentInstance.visibleRows.set(5);
      fixture.detectChanges();
      const body = fixture.nativeElement.querySelector('.body') as HTMLElement;
      // Default compactRows is null -> keeps visibleRows (5)
      expect(body.style.height).toBe('454px');

      fixture.componentInstance.compactRows.set(3);
      fixture.detectChanges();
      expect(body.style.height).toBe('270px'); // 3*82 + 2*10 + 4
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('hides header when selectable=false', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.selectable.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.header')).toBeNull();
  });

  it('toggles items in order and select-all selects/clears visible items', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.test-row') as NodeListOf<HTMLButtonElement>;
    rows[2].click();
    rows[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['3', '1']);

    const selectAllBtn = fixture.nativeElement.querySelector('.header button') as HTMLButtonElement;
    selectAllBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['1', '2', '3']);
    expect(selectAllBtn.getAttribute('aria-pressed')).toBe('true');

    selectAllBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([]);
  });

  it('prunes selectedIds when items change', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.selectedIds.set(['1', '2', '3']);
    fixture.detectChanges();

    fixture.componentInstance.items.set([{ id: '2', title: 'Two' }]);
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['2']);
  });

  it('supports noSelectionMeansAll pressed state and empty slot', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.noSelectionMeansAll.set(true);
    fixture.componentInstance.selectedIds.set([]);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.header button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    fixture.componentInstance.selectedIds.set(['1']);
    fixture.detectChanges();
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([]);

    fixture.componentInstance.items.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-msg')?.textContent).toBe('Nothing here');
  });

  it('singleSelect hides select-all and allows only 1 item selected at a time', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.singleSelect.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header button')).toBeNull();

    const rows = fixture.nativeElement.querySelectorAll('.test-row') as NodeListOf<HTMLButtonElement>;
    rows[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['1']);

    rows[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['2']);

    rows[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([]);
  });

  it('renders 1000 items with virtualScroll=true without freezing', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const many = Array.from({ length: 1000 }, (_, i) => ({ id: `${i}`, title: `Item ${i}` }));
    fixture.componentInstance.virtualScroll.set(true);
    fixture.componentInstance.items.set(many);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport')).toBeTruthy();
  });
});
