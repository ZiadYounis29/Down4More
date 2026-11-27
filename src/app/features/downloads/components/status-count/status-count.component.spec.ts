import { TestBed } from '@angular/core/testing';
import { StatusCountComponent } from './status-count.component';

describe('StatusCountComponent', () => {
  it('renders counts with 999+ cap and toggles filter on pill click', () => {
    const fixture = TestBed.createComponent(StatusCountComponent);
    fixture.componentRef.setInput('counts', { done: 4, downloading: 1200, failed: 2 });
    fixture.detectChanges();

    const pills = Array.from(
      fixture.nativeElement.querySelectorAll('button.pill'),
    ) as HTMLButtonElement[];
    expect(pills.map((p) => p.textContent?.trim())).toEqual([
      '4 Done',
      '999+ Downloading',
      '2 Failed',
    ]);
    expect(pills.every((p) => p.getAttribute('aria-pressed') === 'false')).toBe(true);

    pills[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('done');
    expect(pills[0].getAttribute('aria-pressed')).toBe('true');

    pills[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
