import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { Option } from '../option.model';

describe('SelectComponent', () => {
  it('sets aria-label, maps number and null options by index, and updates value on change', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectComponent<number | null>);
    const component = fixture.componentInstance;
    const options: Option<number | null>[] = [
      { value: null, label: 'Auto' },
      { value: 128, label: '128 kbps' },
      { value: 320, label: '320 kbps' },
    ];

    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 128);
    fixture.componentRef.setInput('label', 'Bit-rate');
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(selectEl.getAttribute('aria-label')).toBe('Bit-rate');
    expect(selectEl.value).toBe('1');
    expect(selectEl.selectedIndex).toBe(1);

    selectEl.value = '0';
    selectEl.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.value()).toBeNull();

    selectEl.value = '2';
    selectEl.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.value()).toBe(320);
  });

  it('shows no selection when value is not in options', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectComponent<string | null>);
    const options: Option<string | null>[] = [
      { value: '1080p', label: '1080p' },
      { value: '720p', label: '720p' },
    ];

    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(selectEl.selectedIndex).toBe(-1);
  });

  it('respects disabled input and does not update value', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectComponent<string>);
    const component = fixture.componentInstance;
    const options: Option<string>[] = [
      { value: 'mp4', label: 'mp4' },
      { value: 'mkv', label: 'mkv' },
    ];

    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 'mp4');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(selectEl.disabled).toBe(true);

    selectEl.value = '1';
    selectEl.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.value()).toBe('mp4');
  });

  it('opens custom menu on trigger click and updates value on option click', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectComponent<string>);
    fixture.componentRef.setInput('options', [
      { value: '1080p', label: '1080p' },
      { value: '720p', label: '720p' },
    ]);
    fixture.componentRef.setInput('value', '1080p');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('button.select') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const opts = fixture.nativeElement.querySelectorAll('.select-option') as NodeListOf<HTMLButtonElement>;
    expect(opts.length).toBe(2);
    opts[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe('720p');
    expect(fixture.nativeElement.querySelector('.select-menu')).toBeNull();
  });
});
