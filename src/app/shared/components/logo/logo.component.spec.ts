import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
  });

  it('renders mark variant by default with height 46px and accessible label', () => {
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.logo') as HTMLElement;
    const svg = fixture.nativeElement.querySelector('.logo__mark') as SVGSVGElement;
    const polygons = fixture.nativeElement.querySelectorAll('polygon');

    expect(root.getAttribute('role')).toBe('img');
    expect(root.getAttribute('aria-label')).toBe('Down4More');
    expect(root.classList.contains('logo--wordmark')).toBe(false);
    expect(svg.style.height).toBe('46px');
    expect(svg.getAttribute('viewBox')).toBe('860 185 925 1070');
    expect(polygons.length).toBe(6);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('supports custom height and label in mark mode', () => {
    fixture.componentRef.setInput('height', '3rem');
    fixture.componentRef.setInput('label', 'D4M Brand');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.logo') as HTMLElement;
    const svg = fixture.nativeElement.querySelector('.logo__mark') as SVGSVGElement;

    expect(root.getAttribute('aria-label')).toBe('D4M Brand');
    expect(svg.style.height).toBe('3rem');
  });

  it('renders wordmark variant with Down and More spans and clears inline height', () => {
    fixture.componentRef.setInput('variant', 'wordmark');
    fixture.detectChanges();

    const root = fixture.nativeElement.querySelector('.logo') as HTMLElement;
    const svg = fixture.nativeElement.querySelector('.logo__mark') as SVGSVGElement;
    const down = fixture.nativeElement.querySelector('.logo__down') as HTMLElement;
    const more = fixture.nativeElement.querySelector('.logo__more') as HTMLElement;

    expect(root.classList.contains('logo--wordmark')).toBe(true);
    expect(down.textContent?.trim()).toBe('Down');
    expect(more.textContent?.trim()).toBe('More');
    expect(svg.style.height).toBe('');
  });
});
