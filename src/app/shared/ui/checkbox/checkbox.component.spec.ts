import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let fixture: ComponentFixture<CheckboxComponent>;
  let component: CheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
  });

  it('renders an interactive checkbox button and toggles value on click', () => {
    fixture.componentRef.setInput('label', 'Select item');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="checkbox"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-checked')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Select item');

    btn.click();
    fixture.detectChanges();
    expect(component.value()).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-checked="mixed" when indeterminate', () => {
    fixture.componentRef.setInput('indeterminate', true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('mixed');
    expect(fixture.nativeElement.querySelector('.dash')).toBeTruthy();
  });

  it('does not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="checkbox"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    expect(component.value()).toBe(false);
  });

  it('renders a span with aria-hidden and no button when presentational', () => {
    fixture.componentRef.setInput('presentational', true);
    fixture.componentRef.setInput('value', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    const span = fixture.nativeElement.querySelector('span.box') as HTMLSpanElement;
    expect(span).toBeTruthy();
    expect(span.getAttribute('aria-hidden')).toBe('true');
    expect(span.classList.contains('box--checked')).toBe(true);
  });
});
