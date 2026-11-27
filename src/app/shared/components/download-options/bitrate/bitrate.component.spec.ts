import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BitrateComponent } from './bitrate.component';

describe('BitrateComponent', () => {
  let fixture: ComponentFixture<BitrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BitrateComponent] }).compileComponents();
    fixture = TestBed.createComponent(BitrateComponent);
    fixture.componentRef.setInput('options', [96, 128, 160, 192, 256, 320]);
    fixture.componentRef.setInput('value', 192);
  });

  it('renders options as "N kbps"', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(sel.options.length).toBe(6);
    expect(sel.options[0].textContent?.trim()).toBe('96 kbps');
    expect(sel.options[3].selected).toBe(true); // 192 is index 3
  });

  it('updates model on change', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    sel.value = '5';
    sel.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(320);
  });

  it('options come from catalog.bitrates, not a free input', () => {
    fixture.componentRef.setInput('options', [128, 192]);
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(sel.options.length).toBe(2);
    expect(sel.options[0].textContent?.trim()).toBe('128 kbps');
  });
});
