import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QualityComponent } from './quality.component';

describe('QualityComponent', () => {
  let fixture: ComponentFixture<QualityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QualityComponent] }).compileComponents();
    fixture = TestBed.createComponent(QualityComponent);
    fixture.componentRef.setInput('options', ['2160p', '1080p', '720p']);
    fixture.componentRef.setInput('value', '1080p');
  });

  it('renders options and selects correct one', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(sel.options.length).toBe(3);
    expect(sel.options[1].selected).toBe(true);
  });

  it('updates model on change', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    sel.value = '2';
    sel.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('720p');
  });

  it('is disabled when input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(sel.disabled).toBe(true);
  });
});
