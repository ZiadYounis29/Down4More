import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThumbBoxComponent } from './thumb-box.component';

describe('ThumbBoxComponent', () => {
  let fixture: ComponentFixture<ThumbBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThumbBoxComponent);
  });

  it('shows play placeholder when src is null', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('d4m-icon')).toBeTruthy();
  });

  it('shows image when src is provided and falls back on error', () => {
    fixture.componentRef.setInput('src', 'https://example.com/thumb.jpg');
    fixture.componentRef.setInput('alt', 'Thumbnail');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('alt')).toBe('Thumbnail');

    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('d4m-icon')).toBeTruthy();
  });

  it('applies size and borderless classes', () => {
    fixture.componentRef.setInput('size', 'single');
    fixture.componentRef.setInput('bordered', false);
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector('.thumb') as HTMLElement;
    expect(box.classList.contains('thumb--single')).toBe(true);
    expect(box.classList.contains('thumb--borderless')).toBe(true);
  });
});
