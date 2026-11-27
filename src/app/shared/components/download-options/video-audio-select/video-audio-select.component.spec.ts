import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoAudioSelectComponent } from './video-audio-select.component';
import type { MediaMode } from '@core/models';

describe('VideoAudioSelectComponent', () => {
  let fixture: ComponentFixture<VideoAudioSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoAudioSelectComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(VideoAudioSelectComponent);
    fixture.componentRef.setInput('value', 'video+audio' as MediaMode);
  });

  it('renders three pills with correct labels', () => {
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('.pill') as NodeListOf<HTMLElement>;
    expect(pills.length).toBe(3);
    expect(pills[0].textContent?.trim()).toBe('video+audio');
    expect(pills[1].textContent?.trim()).toBe('audio only');
    expect(pills[2].textContent?.trim()).toBe('video only');
  });

  it('marks selected pill with aria-pressed=true', () => {
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('.pill') as NodeListOf<HTMLButtonElement>;
    expect(pills[0].getAttribute('aria-pressed')).toBe('true');
    expect(pills[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('updates model on click', () => {
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('.pill') as NodeListOf<HTMLButtonElement>;
    pills[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('audio-only');
  });

  it('ignores clicks when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('.pill') as NodeListOf<HTMLButtonElement>;
    pills[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('video+audio');
  });
});
