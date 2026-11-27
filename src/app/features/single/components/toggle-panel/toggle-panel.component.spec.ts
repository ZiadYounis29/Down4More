import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TogglePanelComponent } from './toggle-panel.component';

describe('TogglePanelComponent', () => {
  let fixture: ComponentFixture<TogglePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TogglePanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TogglePanelComponent);
    fixture.componentRef.setInput('label', 'Frame Size');
  });

  it('shows label and hides expanded content when closed', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.tp__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Frame Size');
    expect(fixture.nativeElement.querySelector('.tp__content')).toBeNull();
  });

  it('shows expanded content when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.tp__content')).not.toBeNull();
  });

  it('dims panel when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('d4m-panel') as HTMLElement;
    expect(panel.classList.contains('tp--disabled')).toBe(true);
  });

  it('switch has role="switch" and aria-checked reflects open state', () => {
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute('aria-checked')).toBe('false');

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles open via model when clicked', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
  });
});
