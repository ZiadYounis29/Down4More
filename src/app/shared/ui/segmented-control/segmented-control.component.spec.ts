import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SegmentedControlComponent } from './segmented-control.component';
import { Option } from '../option.model';

describe('SegmentedControlComponent', () => {
  let fixture: ComponentFixture<SegmentedControlComponent<string>>;
  let component: SegmentedControlComponent<string>;

  const options: Option<string>[] = [
    { value: 'video+audio', label: 'video+audio' },
    { value: 'audio-only', label: 'audio only' },
    { value: 'video-only', label: 'video only', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentedControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentedControlComponent<string>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 'video+audio');
    fixture.componentRef.setInput('label', 'Media mode');
    fixture.detectChanges();
  });

  it('renders a group with one pressed pill and updates value on click', () => {
    const group = fixture.nativeElement.querySelector('[role="group"]') as HTMLElement;
    expect(group.getAttribute('aria-label')).toBe('Media mode');

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button.pill'),
    ) as HTMLButtonElement[];
    expect(buttons.length).toBe(3);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');

    buttons[1].click();
    fixture.detectChanges();

    expect(component.value()).toBe('audio-only');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('respects option.disabled', () => {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button.pill'),
    ) as HTMLButtonElement[];
    expect(buttons[2].disabled).toBe(true);

    buttons[2].click();
    fixture.detectChanges();

    expect(component.value()).toBe('video+audio');
  });

  it('disables all pills when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button.pill'),
    ) as HTMLButtonElement[];
    expect(buttons.every((b) => b.disabled)).toBe(true);

    buttons[1].click();
    fixture.detectChanges();
    expect(component.value()).toBe('video+audio');
  });
});
