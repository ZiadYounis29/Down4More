import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { TrimSegment } from '@core/models';
import { IconComponent } from '@shared/ui/icon';
import { TogglePanelComponent } from '@features/single/components/toggle-panel';
import { formatClock } from './formatClock';

@Component({
  selector: 'd4m-trim-video',
  templateUrl: './trim-video.component.html',
  styleUrl: './trim-video.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TogglePanelComponent],
})
export class TrimVideoComponent {
  readonly open = model(false);
  readonly durationSec = input<number | null>(null);
  readonly segments = model<TrimSegment[]>([]);

  readonly selectedIndex = signal(0);
  readonly dragging = signal<'start' | 'end' | null>(null);

  private readonly trackRef = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly disabled = computed(() => this.durationSec() == null || this.durationSec()! <= 0);
  protected readonly maxSec = computed(() => Math.max(0, this.durationSec() ?? 0));

  /**
   * Display list: when `segments()` is empty, show one virtual "All segments" entry
   * covering 0..durationSec without mutating `segments()`.
   */
  protected readonly displaySegments = computed(() => {
    const list = this.segments();
    if (list.length === 0) {
      return [{ label: 'All segments', startSec: 0, endSec: this.maxSec(), virtual: true }];
    }
    return list.map((seg, i) => ({
      label: i === 0 ? 'All segments' : `Segment ${i + 1}`,
      startSec: seg.startSec,
      endSec: seg.endSec,
      virtual: false,
    }));
  });

  protected readonly activeIndex = computed(() => {
    const len = this.displaySegments().length;
    const idx = this.selectedIndex();
    return idx >= 0 && idx < len ? idx : 0;
  });

  protected readonly activeSegment = computed(() => this.displaySegments()[this.activeIndex()]);

  protected readonly startPercent = computed(() => {
    const max = this.maxSec();
    if (max <= 0) return 0;
    return (this.activeSegment().startSec / max) * 100;
  });

  protected readonly endPercent = computed(() => {
    const max = this.maxSec();
    if (max <= 0) return 100;
    return (this.activeSegment().endSec / max) * 100;
  });

  protected readonly railDotTop = computed(() => `${this.activeIndex() * 52 + 15}px`);

  protected formatTime(sec: number): string {
    return formatClock(sec);
  }

  protected selectSegment(index: number): void {
    this.selectedIndex.set(index);
  }

  protected addSegment(): void {
    const max = this.maxSec();
    const current = this.segments();
    if (current.length === 0) {
      this.segments.set([
        { startSec: 0, endSec: max },
        { startSec: 0, endSec: max },
      ]);
      this.selectedIndex.set(1);
    } else {
      const next = [...current, { startSec: 0, endSec: max }];
      this.segments.set(next);
      this.selectedIndex.set(next.length - 1);
    }
  }

  protected removeSegment(index: number, event: Event): void {
    event.stopPropagation();
    const current = this.segments();
    if (current.length <= 1) return;
    const next = current.filter((_, i) => i !== index);
    this.segments.set(next);
    if (this.selectedIndex() >= next.length) {
      this.selectedIndex.set(Math.max(0, next.length - 1));
    }
  }

  protected onKnobKeyDown(which: 'start' | 'end', event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 1;
    let delta = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = step;
    else return;

    event.preventDefault();
    const seg = this.activeSegment();
    const newVal = (which === 'start' ? seg.startSec : seg.endSec) + delta;
    this.updateActiveBound(which, newVal);
  }

  protected onKnobPointerDown(which: 'start' | 'end', event: PointerEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.dragging.set(which);
  }

  protected onKnobPointerMove(which: 'start' | 'end', event: PointerEvent): void {
    if (this.dragging() !== which) return;
    const track = this.trackRef()?.nativeElement;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const sec = Math.round(ratio * this.maxSec());
    this.updateActiveBound(which, sec);
  }

  protected onKnobPointerUp(which: 'start' | 'end', event: PointerEvent): void {
    if (this.dragging() === which) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      this.dragging.set(null);
    }
  }

  private updateActiveBound(which: 'start' | 'end', rawSec: number): void {
    const max = this.maxSec();
    if (max <= 0) return;

    const current = this.segments();
    const list: TrimSegment[] =
      current.length === 0 ? [{ startSec: 0, endSec: max }] : current.map((s) => ({ ...s }));
    const idx = this.activeIndex();
    const target = list[idx];
    if (!target) return;

    if (which === 'start') {
      target.startSec = Math.max(0, Math.min(rawSec, target.endSec - 1));
    } else {
      target.endSec = Math.min(max, Math.max(rawSec, target.startSec + 1));
    }
    this.segments.set(list);
  }
}
