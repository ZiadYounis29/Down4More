import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TrimSegment } from '@core/models';
import { TrimVideoComponent } from '@features/single/components/trim-video';

/** Demo for d4m-trim-video — covers collapsed, default, segments, and disabled states. */
@Component({
  selector: 'd4m-trim-video-demo',
  templateUrl: './trim-video.demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TrimVideoComponent],
})
export class TrimVideoDemoComponent {
  // ── Collapsed (panel closed) ─────────────────────────────────────────────────
  readonly collapsedOpen = signal(false);

  // ── All segments (open, segments=[]) ─────────────────────────────────────────
  readonly allSegmentsOpen = signal(true);
  readonly allSegmentsSegs = signal<TrimSegment[]>([]);

  // ── Three segments ───────────────────────────────────────────────────────────
  readonly threeOpen = signal(true);
  readonly threeSegs = signal<TrimSegment[]>([
    { startSec: 0, endSec: 60 },
    { startSec: 90, endSec: 180 },
    { startSec: 210, endSec: 300 },
  ]);

  // ── Unknown duration (disabled) ───────────────────────────────────────────────
  readonly disabledOpen = signal(true);
}
