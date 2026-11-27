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

  it('adds and removes segments', () => {
    fixture.componentRef.setInput('durationSec', 120);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const addBtn = fixture.nativeElement.querySelector('button.add') as HTMLButtonElement;
    addBtn.click();
    fixture.detectChanges();
    expect(component.segments().length).toBe(2);

    const removeBtn = fixture.nativeElement.querySelector('button.seg-field__remove') as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();
    expect(component.segments().length).toBe(1);
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
});
