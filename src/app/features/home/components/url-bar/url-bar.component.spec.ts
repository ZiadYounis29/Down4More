import { TestBed } from '@angular/core/testing';
import { UrlBarComponent } from './url-bar.component';

describe('UrlBarComponent', () => {
  it('disables plus when empty or loading and emits add on click and Enter', () => {
    const fixture = TestBed.createComponent(UrlBarComponent);
    const added: number[] = [];
    fixture.componentInstance.add.subscribe(() => added.push(1));
    fixture.detectChanges();

    const plusBtn = fixture.nativeElement.querySelector('button[aria-label="Add link"]') as HTMLButtonElement;
    const input = fixture.nativeElement.querySelector('input[aria-label="Link"]') as HTMLInputElement;
    expect(plusBtn.disabled).toBe(true);

    input.value = 'https://youtube.com/watch?v=abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(plusBtn.disabled).toBe(false);

    plusBtn.click();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(added).toHaveLength(2);

    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(plusBtn.disabled).toBe(true);
    expect(input.disabled).toBe(true);
  });

  it('shows inline error with role="alert" and emits fetch when enabled', () => {
    const fixture = TestBed.createComponent(UrlBarComponent);
    const fetched: number[] = [];
    fixture.componentInstance.fetch.subscribe(() => fetched.push(1));
    fixture.componentRef.setInput('error', "That doesn't look like a link.");
    fixture.componentRef.setInput('canFetch', true);
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.textContent).toContain("That doesn't look like a link.");

    const fetchBtn = fixture.nativeElement.querySelector('d4m-nav-buttons button') as HTMLButtonElement;
    fetchBtn.click();
    expect(fetched).toHaveLength(1);
  });
});
