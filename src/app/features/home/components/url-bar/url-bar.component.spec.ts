// Unresolved import: @shared/components/nav-buttons (owned by P5 T2, not on main yet).
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrlBarComponent } from './url-bar.component';

describe('UrlBarComponent', () => {
  let fixture: ComponentFixture<UrlBarComponent>;
  let component: UrlBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrlBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UrlBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits add on plus button click', () => {
    let emitted = false;
    component.add.subscribe(() => {
      emitted = true;
    });
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(emitted).toBe(true);
  });

  it('emits add on Enter in input', () => {
    let emitted = false;
    component.add.subscribe(() => {
      emitted = true;
    });
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'https://youtube.com/watch?v=abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
    expect(emitted).toBe(true);
  });

  it('disables plus when value is empty', () => {
    component.value.set('');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('disables plus when loading', () => {
    component.value.set('https://youtube.com/watch?v=abc');
    component.loading.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('shows error text when error input is set', () => {
    component.error.set('That does not look like a link.');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.url-bar__error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('That does not look like a link.');
  });
});
