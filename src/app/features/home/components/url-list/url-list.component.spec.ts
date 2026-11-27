import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlListComponent } from './url-list.component';
import { UrlEntry } from '../url-entry.model';

const entry = (id: string, url: string, kind: UrlEntry['kind'] = 'video', failed = false): UrlEntry => ({
  id,
  url,
  key: url,
  kind,
  failed,
});

describe('UrlListComponent', () => {
  let fixture: ComponentFixture<UrlListComponent>;
  let component: UrlListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders one column for 1 to 3 entries', () => {
    component.entries.set([entry('e-1', 'https://a.com')]);
    fixture.detectChanges();
    expect(component.isTwoCol()).toBe(false);
    expect(component.columnEntries().length).toBe(1);

    component.entries.set([entry('e-1', 'https://a.com'), entry('e-2', 'https://b.com'), entry('e-3', 'https://c.com')]);
    fixture.detectChanges();
    expect(component.isTwoCol()).toBe(false);
  });

  it('renders two columns for 4+ entries', () => {
    component.entries.set([
      entry('e-1', 'https://a.com'),
      entry('e-2', 'https://b.com'),
      entry('e-3', 'https://c.com'),
      entry('e-4', 'https://d.com'),
    ]);
    fixture.detectChanges();
    expect(component.isTwoCol()).toBe(true);
    expect(component.columnEntries().length).toBe(2);
  });

  it('computes rows per column as max(3, ceil(n/2))', () => {
    component.entries.set([
      entry('e-1', 'https://a.com'),
      entry('e-2', 'https://b.com'),
      entry('e-3', 'https://c.com'),
      entry('e-4', 'https://d.com'),
      entry('e-5', 'https://e.com'),
      entry('e-6', 'https://f.com'),
      entry('e-7', 'https://g.com'),
    ]);
    fixture.detectChanges();
    expect(component.rowsPerColumn()).toBe(4);
    expect(component.columnEntries()[0].length).toBe(4);
    expect(component.columnEntries()[1].length).toBe(3);
  });

  it('shows failed chip for failed entries', () => {
    component.entries.set([entry('e-1', 'https://a.com', 'video', true)]);
    fixture.detectChanges();
    const tag = fixture.nativeElement.querySelector('d4m-tag');
    expect(tag).toBeTruthy();
    const chip = fixture.nativeElement.querySelector('.url-list__chip');
    expect(chip).toBeNull();
  });

  it('shows type chip for non-failed entries', () => {
    component.entries.set([entry('e-1', 'https://a.com', 'video')]);
    fixture.detectChanges();
    const chip = fixture.nativeElement.querySelector('.url-list__chip');
    expect(chip).toBeTruthy();
    expect(chip.textContent).toContain('Video');
  });

  it('emits remove with entry id', () => {
    let removedId: string | null = null;
    component.remove.subscribe(id => {
      removedId = id;
    });
    component.entries.set([entry('e-1', 'https://a.com')]);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(removedId).toBe('e-1');
  });

  it('emits clear on Clear all', () => {
    let cleared = false;
    component.clear.subscribe(() => {
      cleared = true;
    });
    component.entries.set([entry('e-1', 'https://a.com')]);
    fixture.detectChanges();
    const ghostButton = fixture.nativeElement.querySelector('.btn--ghost');
    ghostButton.click();
    expect(cleared).toBe(true);
  });

  it('disables remove and Clear all when disabled', () => {
    component.entries.set([entry('e-1', 'https://a.com')]);
    component.disabled.set(true);
    fixture.detectChanges();
    const removeBtn = fixture.nativeElement.querySelector('button.btn--danger');
    const clearBtn = fixture.nativeElement.querySelector('.btn--ghost');
    expect(removeBtn.disabled).toBe(true);
    expect(clearBtn.disabled).toBe(true);
  });
});
