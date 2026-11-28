import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeShiftInputComponent } from './time-shift-input.component';

describe('TimeShiftInputComponent', () => {
  let fixture: ComponentFixture<TimeShiftInputComponent>;
  let component: TimeShiftInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeShiftInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeShiftInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', 15);
    fixture.componentRef.setInput('maxSec', 7200);
    fixture.detectChanges();
  });

  it('shifts digits on the left of cursor to the left and keeps colons visual', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('00:00:15');

    const emitted: number[] = [];
    component.valueChange.subscribe((v) => emitted.push(v));

    input.dispatchEvent(new FocusEvent('focus'));
    // Cursor at end (pos 8): typing '3' shifts left digits -> 00:01:53
    input.setSelectionRange(8, 8);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    fixture.detectChanges();
    expect(input.value).toBe('00:01:53');

    // Backspace deletes '3' on the left of cursor and shifts left digits right -> 00:00:15
    input.setSelectionRange(8, 8);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();
    expect(input.value).toBe('00:00:15');

    // Backspace right after colon (pos 6) skips ':' and deletes digit on the left -> 00:00:15 stays 00:00:15? No, '0000' -> '000'
    input.value = '00:01:23';
    // Test inserting between '2' and '3' (pos 7): shifts left digits ('00012' -> '0012') + '9' + '3' = 00:12:93
    fixture.componentRef.setInput('value', 83); // 00:01:23
    input.dispatchEvent(new FocusEvent('blur'));
    input.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    input.setSelectionRange(7, 7);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));
    fixture.detectChanges();
    expect(input.value).toBe('00:12:93');
    expect(emitted.length).toBeGreaterThan(0);
  });

  it('never deletes colons when Backspace is pressed right after a colon', () => {
    fixture.componentRef.setInput('value', 65); // 00:01:05
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new FocusEvent('focus'));
    input.setSelectionRange(6, 6); // right after second ':'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();

    expect(input.value).toBe('00:00:05');
    expect(input.value.split(':')).toHaveLength(3);
  });

  it('keeps cursor in place when deleting a digit in the middle', () => {
    fixture.componentRef.setInput('value', 83); // 00:01:23
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new FocusEvent('focus'));
    input.setSelectionRange(7, 7); // between '2' and '3'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();

    expect(input.value).toBe('00:00:13');
    expect(input.selectionStart).toBe(7);
    expect(input.selectionEnd).toBe(7);
  });

  it('does not jump across a colon when typing or deleting immediately to the left of ":"', () => {
    fixture.componentRef.setInput('value', 83); // 00:01:23
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.dispatchEvent(new FocusEvent('focus'));
    input.setSelectionRange(5, 5); // immediately left of second ':' (00:01|:23)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '4' }));
    fixture.detectChanges();

    expect(input.value).toBe('00:14:23');
    expect(input.selectionStart).toBe(5);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    fixture.detectChanges();
    expect(input.value).toBe('00:01:23');
    expect(input.selectionStart).toBe(5);
  });
});
