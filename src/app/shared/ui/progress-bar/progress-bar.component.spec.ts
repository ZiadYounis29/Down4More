import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let fixture: ComponentFixture<ProgressBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
  });

  it('renders progressbar ARIA attributes and fill width', () => {
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('label', 'Progress of Rocket landing');
    fixture.detectChanges();

    const track = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    const fill = fixture.nativeElement.querySelector('.fill') as HTMLElement;

    expect(track.getAttribute('aria-valuemin')).toBe('0');
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    expect(track.getAttribute('aria-valuenow')).toBe('42');
    expect(track.getAttribute('aria-label')).toBe('Progress of Rocket landing');
    expect(track.getAttribute('aria-live')).toBeNull();
    expect(fill.style.width).toBe('42%');
    expect(fill.classList.contains('fill--processing')).toBe(false);
  });

  it('clamps values below 0 and above 100', () => {
    fixture.componentRef.setInput('value', -10);
    fixture.detectChanges();

    const track = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    const fill = fixture.nativeElement.querySelector('.fill') as HTMLElement;

    expect(track.getAttribute('aria-valuenow')).toBe('0');
    expect(fill.style.width).toBe('0%');

    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();

    expect(track.getAttribute('aria-valuenow')).toBe('100');
    expect(fill.style.width).toBe('100%');
  });

  it('applies processing variant class', () => {
    fixture.componentRef.setInput('value', 100);
    fixture.componentRef.setInput('variant', 'processing');
    fixture.detectChanges();

    const fill = fixture.nativeElement.querySelector('.fill') as HTMLElement;
    expect(fill.classList.contains('fill--processing')).toBe(true);
  });
});
