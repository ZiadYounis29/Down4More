import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent, IconName } from './icon.component';

const ALL_ICONS: IconName[] = [
  'plus',
  'x',
  'pause',
  'play',
  'check',
  'retry',
  'arrow-down',
  'arrow-up',
  'chevron-left',
  'chevron-right',
  'trash',
  'warning',
  'moon',
  'sun',
  'search',
];

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
  });

  it('renders each IconName without error', () => {
    for (const name of ALL_ICONS) {
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
      expect(svg).toBeTruthy();
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.children.length).toBeGreaterThan(0);
    }
  });

  it('updates width, height, and stroke-width from inputs', () => {
    fixture.componentRef.setInput('name', 'check');
    fixture.componentRef.setInput('size', 14);
    fixture.componentRef.setInput('stroke', 3.2);
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('14');
    expect(svg.getAttribute('height')).toBe('14');
    expect(svg.getAttribute('stroke-width')).toBe('3.2');
  });

  it('renders filled shapes for pause and play', () => {
    fixture.componentRef.setInput('name', 'pause');
    fixture.detectChanges();
    let svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.getAttribute('stroke')).toBe('none');

    fixture.componentRef.setInput('name', 'play');
    fixture.detectChanges();
    svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('fill')).toBe('currentColor');
  });
});
