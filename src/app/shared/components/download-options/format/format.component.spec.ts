import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatComponent } from './format.component';

describe('FormatComponent', () => {
  let fixture: ComponentFixture<FormatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormatComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormatComponent);
    fixture.componentRef.setInput('options', ['mp4', 'mkv', 'webm']);
    fixture.componentRef.setInput('value', 'mp4');
  });

  it('renders options and selects mp4', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(sel.options.length).toBe(3);
    expect(sel.options[0].selected).toBe(true);
  });

  it('updates model on change', () => {
    fixture.detectChanges();
    const sel = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    sel.value = '1';
    sel.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('mkv');
  });
});
