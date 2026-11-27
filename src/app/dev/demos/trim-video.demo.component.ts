// WAITING: This demo is blocked on two unresolved P2 dependencies:
//   1. TrimVideoComponent (@features/single/components/trim-video) — owned by P3/T6,
//      but its own import of TogglePanelComponent (@features/single/components/toggle-panel)
//      is unresolved until P2 merges.
//   2. The trim-video feature folder does not exist on this branch because
//      p3/t6-trim-video was not merged into the p3/t8-demos chain yet (it is a
//      parallel branch waiting on P2).
//
// Once P2 merges toggle-panel to main and p3/t6 and p3/t7 are rebased/merged,
// replace this stub with the full demo (see trim-video.demo.component.html).
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Demo for d4m-trim-video — waiting on P2 TogglePanelComponent and P3/T6 merge. */
@Component({
  selector: 'd4m-trim-video-demo',
  template: `
    <section class="demo-section">
      <h2>Trim Video (Single)</h2>
      <p class="waiting-notice">
        ⏳ <strong>Waiting:</strong> TrimVideoComponent depends on
        <code>TogglePanelComponent</code> from P2 which is not yet merged to main.
        Demo will be enabled once P2 merges.
      </p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimVideoDemoComponent {}
