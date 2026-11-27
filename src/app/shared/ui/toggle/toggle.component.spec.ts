import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let fixture: ComponentFixture<ToggleComponent>;
  let component: ToggleComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
  });

  it('renders switch role, aria-checked, aria-label, and toggles on click', () => {
    fixture.componentRef.setInput('label', 'Enable trim');
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-checked')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Enable trim');
    expect(btn.hasAttribute('aria-expanded')).toBe(false);
    expect(btn.textContent?.trim()).toBe('Off');

    btn.click();
    fixture.detectChanges();

    expect(component.value()).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(btn.textContent?.trim()).toBe('On');
  });

  it('sets aria-expanded only when expanded is not null', () => {
    fixture.componentRef.setInput('expanded', false);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('false');

    fixture.componentRef.setInput('expanded', true);
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    fixture.componentRef.setInput('expanded', null);
    fixture.detectChanges();
    expect(btn.hasAttribute('aria-expanded')).toBe(false);
  });

  it('hides Off/On text when showText is false', () => {
    fixture.componentRef.setInput('showText', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.text')).toBeNull();
  });

  it('does not toggle when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    fixture.detectChanges();

    expect(component.value()).toBe(false);
    expect(btn.getAttribute('aria-checked')).toBe('false');
  });
});
