import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrimVideoComponent } from './trim-video.component';

describe('TrimVideoComponent', () => {
  let fixture: ComponentFixture<TrimVideoComponent>;
  let component: TrimVideoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrimVideoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrimVideoComponent);
    component = fixture.componentInstance;
  });

  it('disables when durationSec is null', () => {
    fixture.componentRef.setInput('durationSec', null);
    fixture.detectChanges();
    expect(component['disabled']()).toBe(true);
  });

  it('shows "All segments" by default when segments is empty', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('All segments');
    expect(component.segments().length).toBe(0);
  });

  it('adds and removes segments without treating "All segments" as a segment', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector('button.add') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();
    expect(component.segments().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Segment 1');

    addBtn.click();
    fixture.detectChanges();
    expect(component.segments().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Segment 2');

    const removeBtn = fixture.nativeElement.querySelector('button.seg-field__remove') as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();
    expect(component.segments().length).toBe(1);
  });

  it('shows all segments on the timeline without time in "All segments" row', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('segments', [
      { startSec: 10, endSec: 25 },
      { startSec: 40, endSec: 60 },
    ]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const fields = el.querySelectorAll('.seg-field');
    expect(fields[0].textContent?.trim()).toBe('All segments');

    // Timeline renders knobs for both Segment 1 and Segment 2 with labels
    const tags = Array.from(el.querySelectorAll('.knob__tag')).map((t) => t.textContent?.trim());
    expect(tags).toEqual(['seg 1', 'seg 1', 'seg 2', 'seg 2']);
  });

  it('supports playback controls: play from start, play/pause, and start from current', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('segments', [{ startSec: 15, endSec: 60 }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const btns = Array.from(fixture.nativeElement.querySelectorAll('.ctrl-btn')) as HTMLButtonElement[];
    expect(btns.length).toBe(3);

    // Play from start sets currentTimeSec to segment start (15) and starts playing
    btns[0].click();
    fixture.detectChanges();
    expect(component.currentTimeSec()).toBe(15);
    expect(component.playing()).toBe(true);

    // Pause stops playing
    btns[1].click();
    fixture.detectChanges();
    expect(component.playing()).toBe(false);

    // Start from current sets active segment startSec to currentTimeSec (30)
    component.currentTimeSec.set(30);
    btns[2].click();
    fixture.detectChanges();
    expect(component.segments()[0].startSec).toBe(30);
  });

  it('knobs cannot cross each other via keyboard', () => {
    fixture.componentRef.setInput('durationSec', 10);
    fixture.componentRef.setInput('segments', [{ startSec: 5, endSec: 6 }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const startKnob = fixture.nativeElement.querySelector('.knob.start') as HTMLElement;
    startKnob.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.segments()[0].startSec).toBe(5);
    expect(component.segments()[0].endSec).toBe(6);
  });

  it('keyboard moves a knob within valid bounds', () => {
    fixture.componentRef.setInput('durationSec', 100);
    fixture.componentRef.setInput('segments', [{ startSec: 10, endSec: 50 }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const startKnob = fixture.nativeElement.querySelector('.knob.start') as HTMLElement;
    startKnob.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(component.segments()[0].startSec).toBe(11);
  });

  it('allows editing segment start/end via shift inputs and updates timeline, while "All segments" is not editable', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('segments', [{ startSec: 1, endSec: 60 }]);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const fields = fixture.nativeElement.querySelectorAll('.seg-field');
    expect(fields[0].querySelectorAll('input')).toHaveLength(0);

    const startInput = fields[1].querySelector('input[aria-label="Segment 1 start time"]') as HTMLInputElement;
    startInput.dispatchEvent(new FocusEvent('focus'));
    startInput.setSelectionRange(8, 8);
    startInput.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
    fixture.detectChanges();

    // 00:00:01 shifted left + '5' -> 00:00:15 = 15s
    expect(component.segments()[0].startSec).toBe(15);
    const rangeBar = fixture.nativeElement.querySelector('.track__range') as HTMLElement;
    expect(parseFloat(rangeBar.style.left)).toBeCloseTo((15 / 120) * 100, 1);
  });
});
