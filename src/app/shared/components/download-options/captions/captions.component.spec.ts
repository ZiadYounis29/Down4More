import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaptionsComponent } from './captions.component';
import type { CaptionSettings } from '@core/models';

describe('CaptionsComponent', () => {
  let fixture: ComponentFixture<CaptionsComponent>;

  const defaultVal: CaptionSettings = { enabled: false, separateFile: false };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CaptionsComponent] }).compileComponents();
    fixture = TestBed.createComponent(CaptionsComponent);
    fixture.componentRef.setInput('value', defaultVal);
  });

  it('shows two selects off by default', () => {
    fixture.detectChanges();
    const sels = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    expect(sels.length).toBe(2);
    expect(sels[0].value).toBe('0');
    expect(sels[1].value).toBe('0');
  });

  it('toggling caption on enables separateFile select', () => {
    fixture.detectChanges();
    const sels = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    sels[0].value = '1';
    sels[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value().enabled).toBe(true);
    expect(sels[1].disabled).toBe(false);
  });

  it('turning captions off resets separateFile', () => {
    fixture.componentRef.setInput('value', { enabled: true, separateFile: true });
    fixture.detectChanges();
    const sels = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    sels[0].value = '0';
    sels[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toEqual({ enabled: false, separateFile: false });
  });

  it('lockSeparate shows "on" for separate file and locks it', () => {
    fixture.componentRef.setInput('value', { enabled: true, separateFile: false });
    fixture.componentRef.setInput('lockSeparate', true);
    fixture.detectChanges();
    const sels = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
    expect(sels[1].value).toBe('1');
    expect(sels[1].disabled).toBe(true);
  });
});
