import { TestBed } from '@angular/core/testing';
import { UrlEntry } from '../../url-entry.model';
import { UrlListComponent } from './url-list.component';

const makeEntries = (count: number): UrlEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `u-${i + 1}`,
    url: `https://youtube.com/watch?v=v${i + 1}`,
    key: `https://youtube.com/watch?v=v${i + 1}`,
    kind: i % 2 === 0 ? 'video' : 'playlist',
  }));

describe('UrlListComponent', () => {
  it('uses single column for 1..3 entries and two-col with balanced rows for 4..7 entries', () => {
    const fixture = TestBed.createComponent(UrlListComponent);
    fixture.componentRef.setInput('entries', makeEntries(3));
    fixture.detectChanges();

    const ul = fixture.nativeElement.querySelector('ul.list') as HTMLUListElement;
    expect(ul.classList.contains('two-col')).toBe(false);
    expect(fixture.nativeElement.querySelector('.list__count')?.textContent).toContain('3 links');

    fixture.componentRef.setInput('entries', makeEntries(4));
    fixture.detectChanges();
    expect(ul.classList.contains('two-col')).toBe(true);
    expect(ul.style.getPropertyValue('--rows-per-col')).toBe('3');

    fixture.componentRef.setInput('entries', makeEntries(7));
    fixture.detectChanges();
    expect(ul.style.getPropertyValue('--rows-per-col')).toBe('4');
  });

  it('shows Couldn\'t load tag for failed entries and emits remove and clear', () => {
    const fixture = TestBed.createComponent(UrlListComponent);
    const entries = makeEntries(2);
    entries[0].failed = true;
    fixture.componentRef.setInput('entries', entries);

    const removed: string[] = [];
    let cleared = 0;
    fixture.componentInstance.remove.subscribe((id) => removed.push(id));
    fixture.componentInstance.clear.subscribe(() => cleared++);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Couldn't load");
    expect(fixture.nativeElement.textContent).toContain('Playlist');

    const removeBtn = fixture.nativeElement.querySelector('button[aria-label="Remove link 1"]') as HTMLButtonElement;
    removeBtn.click();
    expect(removed).toEqual(['u-1']);

    const clearBtn = fixture.nativeElement.querySelector('.list__footer button') as HTMLButtonElement;
    clearBtn.click();
    expect(cleared).toBe(1);
  });
});
