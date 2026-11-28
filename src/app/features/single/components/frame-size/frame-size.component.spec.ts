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
    expect(fixture.nativeElement.querySelector('.fs')).toBeNull();
  });

  it('shows fill type and aspect ratio options when open is true', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const fs = fixture.nativeElement.querySelector('.fs') as HTMLElement;
    expect(fs).not.toBeNull();
    expect(fs.textContent).toContain('Fill Type');
    expect(fs.textContent).toContain('Crop');
    expect(fs.textContent).toContain('Blur');
    expect(fs.textContent).toContain('Black');
    expect(fs.textContent).toContain('Aspect Ratio');
    expect(fs.textContent).toContain('Original');
    expect(fs.textContent).toContain('16:9');
    expect(fs.textContent).toContain('Custom');
  });

  it('toggles open via model when switch clicked', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);
    expect(fixture.nativeElement.querySelector('.fs')).not.toBeNull();
  });

  it('updates fill, aspect, and custom dimensions', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const pills = Array.from(fixture.nativeElement.querySelectorAll('button.fs__pill')) as HTMLButtonElement[];
    pills.find((b) => b.textContent?.trim() === 'Blur')?.click();
    pills.find((b) => b.textContent?.trim() === '9:16')?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value().fill).toBe('blur');
    expect(fixture.componentInstance.value().aspect).toBe('9:16');

    const nums = fixture.nativeElement.querySelectorAll('input.fs__num') as NodeListOf<HTMLInputElement>;
    nums[0].value = '3';
    nums[0].dispatchEvent(new Event('input'));
    nums[1].value = '4';
    nums[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toMatchObject({
      fill: 'blur',
      aspect: 'custom',
      customW: 3,
      customH: 4,
    });
    expect(fixture.componentInstance.value().crop).toBeDefined();
  });

  it('updates normalized crop coordinates when frame is moved via keyboard', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    // Pick 9:16 so width < 1 and box can move horizontally
    const pills = Array.from(fixture.nativeElement.querySelectorAll('button.fs__pill')) as HTMLButtonElement[];
    pills.find((b) => b.textContent?.trim() === '9:16')?.click();
    fixture.detectChanges();

    const initialX = fixture.componentInstance.value().crop!.x;
    const frame = fixture.nativeElement.querySelector('.fs__frame') as HTMLElement;
    frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value().crop!.x).toBeGreaterThan(initialX);
  });

  it('dragging an edge updates aspect to custom and sets 1-decimal customW/customH', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const preview = fixture.nativeElement.querySelector('.fs__preview') as HTMLElement;
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 160,
      height: 90,
      right: 160,
      bottom: 90,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const rightEdge = fixture.nativeElement.querySelector('.fs__edge--e') as HTMLElement;
    rightEdge.setPointerCapture = vi.fn();
    rightEdge.releasePointerCapture = vi.fn();

    rightEdge.dispatchEvent(new PointerEvent('pointerdown', { clientX: 160, clientY: 45, pointerId: 1 }));
    rightEdge.dispatchEvent(new PointerEvent('pointermove', { clientX: 80, clientY: 45, pointerId: 1 }));
    rightEdge.dispatchEvent(new PointerEvent('pointerup', { clientX: 80, clientY: 45, pointerId: 1 }));
    fixture.detectChanges();

    const v = fixture.componentInstance.value();
    expect(v.aspect).toBe('custom');
    expect(v.crop!.width).toBeCloseTo(0.5, 2);
    // 0.5 * (16/9) = 8/9 -> portrait, so customW=9, customH=round1(9 / (8/9))=10.1
    expect(v.customW).toBe(9);
    expect(v.customH).toBe(10.1);
  });

  it('dragging any corner scales the box while preserving aspect ratio', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const pills = Array.from(fixture.nativeElement.querySelectorAll('button.fs__pill')) as HTMLButtonElement[];
    pills.find((b) => b.textContent?.trim() === '16:9')?.click();
    fixture.detectChanges();

    const preview = fixture.nativeElement.querySelector('.fs__preview') as HTMLElement;
    vi.spyOn(preview, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 160,
      height: 90,
      right: 160,
      bottom: 90,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const corners = fixture.nativeElement.querySelectorAll('.fs__corner') as NodeListOf<HTMLElement>;
    expect(corners).toHaveLength(4);

    const se = fixture.nativeElement.querySelector('.fs__corner--se') as HTMLElement;
    se.setPointerCapture = vi.fn();
    se.releasePointerCapture = vi.fn();
    se.dispatchEvent(new PointerEvent('pointerdown', { clientX: 160, clientY: 90, pointerId: 1 }));
    se.dispatchEvent(new PointerEvent('pointermove', { clientX: 80, clientY: 45, pointerId: 1 }));
    se.dispatchEvent(new PointerEvent('pointerup', { clientX: 80, clientY: 45, pointerId: 1 }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value().aspect).toBe('16:9');
    expect(fixture.componentInstance.value().crop).toEqual({
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
    });
  });
});
