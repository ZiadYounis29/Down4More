import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrameSizeComponent } from './frame-size.component';

describe('FrameSizeComponent', () => {
  let fixture: ComponentFixture<FrameSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameSizeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrameSizeComponent);
  });

  it('renders collapsed by default with label "Frame Size"', () => {
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.tp__label') as HTMLElement;
    expect(label.textContent?.trim()).toBe('Frame Size');
    expect(fixture.nativeElement.querySelector('.fs__placeholder')).toBeNull();
  });

  it('shows placeholder when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.fs__placeholder') as HTMLElement;
    expect(placeholder).not.toBeNull();
    expect(placeholder.textContent?.trim()).toBe('Frame size options go here');
  });

  it('toggles open via model when switch clicked', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.nativeElement.querySelector('.fs__placeholder')).not.toBeNull();
  });
});
