import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { TrimSegment } from '@core/models';
import { IconComponent } from '@shared/ui/icon';
import { TogglePanelComponent } from '@features/single/components/toggle-panel';
import { formatClock } from './formatClock';
import { TimeShiftInputComponent } from './time-shift-input.component';

const SEGMENT_COLORS = [
  '#5EC8FF', // seg 1 - cyan
  '#FF5C6C', // seg 2 - coral
  '#5FD38D', // seg 3 - green
  '#FFD84D', // seg 4 - amber
  '#B388FF', // seg 5 - purple
  '#FF9F43', // seg 6 - orange
];

export interface TimelineSegment {
  index: number;
  label: string;
  shortLabel: string;
  startSec: number;
  endSec: number;
  startPct: number;
  endPct: number;
  color: string;
  virtual: boolean;
}

@Component({
  selector: 'd4m-trim-video',
  templateUrl: './trim-video.component.html',
  styleUrl: './trim-video.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TogglePanelComponent, TimeShiftInputComponent],
})
export class TrimVideoComponent {
  readonly open = model(false);
  readonly durationSec = input<number | null>(null);
  readonly segments = model<TrimSegment[]>([]);

  /** -1 = "All segments" overview; 0..n-1 = specific segment index. */
  readonly selectedIndex = signal(-1);
  readonly dragging = signal<{ segIndex: number; which: 'start' | 'end' } | null>(null);
  readonly playing = signal(false);
  readonly currentTimeSec = signal(0);

  private readonly destroyRef = inject(DestroyRef);
  private playTimer: ReturnType<typeof setInterval> | null = null;
  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');

  constructor() {
    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  protected readonly playheadPercent = computed(() => {
    const max = this.maxSec();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (this.currentTimeSec() / max) * 100));
  });

  protected readonly disabled = computed(() => this.durationSec() == null || this.durationSec()! <= 0);
  protected readonly maxSec = computed(() => Math.max(0, this.durationSec() ?? 0));

  /** Active index clamped: -1 for "All segments", or 0..segments.length-1. */
  protected readonly activeIndex = computed(() => {
    const len = this.segments().length;
    const idx = this.selectedIndex();
    if (idx < 0 || idx >= len) return -1;
    return idx;
  });

  protected readonly isAllSelected = computed(() => this.activeIndex() === -1);

  /** Segments rendered on the timeline (all segments when "All segments" is selected, or the active one). */
  protected readonly timelineSegments = computed<TimelineSegment[]>(() => {
    const max = this.maxSec();
    const list = this.segments();
    const toPercent = (sec: number) => (max > 0 ? (sec / max) * 100 : 0);

    if (list.length === 0) {
      return [
        {
          index: 0,
          label: 'Segment 1',
          shortLabel: 'seg 1',
          startSec: 0,
          endSec: max,
          startPct: 0,
          endPct: max > 0 ? 100 : 0,
          color: SEGMENT_COLORS[0],
          virtual: true,
        },
      ];
    }

    const active = this.activeIndex();
    const mapped = list.map((seg, i) => ({
      index: i,
      label: `Segment ${i + 1}`,
      shortLabel: `seg ${i + 1}`,
      startSec: seg.startSec,
      endSec: seg.endSec,
      startPct: toPercent(seg.startSec),
      endPct: toPercent(seg.endSec),
      color: this.segmentColor(i),
      virtual: false,
    }));

    return active === -1 ? mapped : [mapped[active]];
  });

  protected readonly timelineStartLabel = computed(() => {
    const active = this.activeIndex();
    if (active === -1) return this.formatTime(0);
    return this.formatTime(this.segments()[active].startSec);
  });

  protected readonly timelineEndLabel = computed(() => {
    const active = this.activeIndex();
    if (active === -1) return this.formatTime(this.maxSec());
    return this.formatTime(this.segments()[active].endSec);
  });

  /** Row 0 is "All segments", rows 1..n are Segment 1..n. */
  protected readonly railDotTop = computed(() => `${(this.activeIndex() + 1) * 52 + 15}px`);

  protected readonly railDotColor = computed(() => {
    const active = this.activeIndex();
    return active === -1 ? 'var(--color-primary)' : this.segmentColor(active);
  });

  protected segmentColor(index: number): string {
    return SEGMENT_COLORS[index % SEGMENT_COLORS.length];
  }

  protected formatTime(sec: number): string {
    return formatClock(sec);
  }

  protected playFromStart(): void {
    const active = this.activeIndex();
    const list = this.segments();
    let start = 0;
    if (active >= 0 && list[active]) {
      start = list[active].startSec;
    } else if (list.length > 0) {
      start = Math.min(...list.map((s) => s.startSec));
    }
    this.currentTimeSec.set(start);
    this.startPlayback();
  }

  protected togglePlay(): void {
    if (this.playing()) {
      this.pausePlayback();
    } else {
      this.startPlayback();
    }
  }

  protected startFromCurrent(): void {
    const cur = this.currentTimeSec();
    const active = this.activeIndex();
    const list = this.segments();
    if (active >= 0) {
      this.updateBound(active, 'start', cur);
      return;
    }
    if (list.length === 0) {
      this.updateBound(0, 'start', cur);
      return;
    }
    const containing = list.findIndex((s) => cur >= s.startSec && cur < s.endSec);
    this.updateBound(containing >= 0 ? containing : 0, 'start', cur);
  }

  protected onTrackClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.knob')) return;
    const track = this.trackRef()?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    this.currentTimeSec.set(Math.round(ratio * this.maxSec()));
  }

  private startPlayback(): void {
    if (this.maxSec() <= 0) return;
    this.stopTimer();
    this.playing.set(true);
    this.playTimer = setInterval(() => this.tickPlayback(), 1000);
  }

  private pausePlayback(): void {
    this.stopTimer();
    this.playing.set(false);
  }

  private stopTimer(): void {
    if (this.playTimer !== null) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  }

  private tickPlayback(): void {
    const active = this.activeIndex();
    const list = this.segments();
    const endLimit =
      active >= 0 && list[active]
        ? list[active].endSec
        : list.length > 0
          ? Math.max(...list.map((s) => s.endSec))
          : this.maxSec();

    const next = this.currentTimeSec() + 1;
    if (next > endLimit) {
      this.pausePlayback();
      return;
    }
    this.currentTimeSec.set(next);
  }

  protected selectSegment(index: number): void {
    this.selectedIndex.set(index);
  }

  protected addSegment(): void {
    const max = this.maxSec();
    const next = [...this.segments(), { startSec: 0, endSec: max }];
    this.segments.set(next);
    this.selectedIndex.set(next.length - 1);
  }

  protected removeSegment(index: number, event: Event): void {
    event.stopPropagation();
    const current = this.segments();
    if (index < 0 || index >= current.length) return;
    const next = current.filter((_, i) => i !== index);
    this.segments.set(next);
    if (next.length === 0 || this.selectedIndex() >= next.length) {
      this.selectedIndex.set(next.length - 1);
    }
  }

  protected onKnobKeyDown(segIndex: number, which: 'start' | 'end', event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    let delta = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step;
    else return;

    event.preventDefault();
    const list = this.segments();
    const seg = list[segIndex] ?? { startSec: 0, endSec: this.maxSec() };
    const newVal = (which === 'start' ? seg.startSec : seg.endSec) + delta;
    this.updateBound(segIndex, which, newVal);
  }

  protected onKnobPointerDown(segIndex: number, which: 'start' | 'end', event: PointerEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.dragging.set({ segIndex, which });
  }

  protected onKnobPointerMove(segIndex: number, which: 'start' | 'end', event: PointerEvent): void {
    const drag = this.dragging();
    if (!drag || drag.segIndex !== segIndex || drag.which !== which) return;
    const track = this.trackRef()?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const sec = Math.round(ratio * this.maxSec());
    this.updateBound(segIndex, which, sec);
  }

  protected onKnobPointerUp(segIndex: number, which: 'start' | 'end', event: PointerEvent): void {
    const drag = this.dragging();
    if (drag && drag.segIndex === segIndex && drag.which === which) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      this.dragging.set(null);
    }
  }

  protected onSegmentTimeChange(segIndex: number, which: 'start' | 'end', sec: number): void {
    this.updateBound(segIndex, which, sec);
  }

  private updateBound(segIndex: number, which: 'start' | 'end', rawSec: number): void {
    const max = this.maxSec();
    if (max <= 0) return;

    const current = this.segments();
    const list: TrimSegment[] =
      current.length === 0 ? [{ startSec: 0, endSec: max }] : current.map((s) => ({ ...s }));
    const target = list[segIndex];
    if (!target) return;

    if (which === 'start') {
      target.startSec = Math.max(0, Math.min(rawSec, target.endSec - 1));
    } else {
      target.endSec = Math.min(max, Math.max(rawSec, target.startSec + 1));
    }
    this.segments.set(list);
  }
}
