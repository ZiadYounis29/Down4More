import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MOCK_MEDIA_ITEMS } from '@core/mocks/mock-data';
import { MediaItem } from '@core/models';
import { MediaThumbnailComponent } from '@shared/components/media-thumbnail';

/** Demo for d4m-media-thumbnail — covers all variants and edge cases. */
@Component({
  selector: 'd4m-media-thumbnail-demo',
  templateUrl: './media-thumbnail.demo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaThumbnailComponent],
})
export class MediaThumbnailDemoComponent {
  // ── Sample items ────────────────────────────────────────────────────────────
  /** Rocket landing — has duration + sizeBytes. */
  readonly itemNormal: MediaItem = MOCK_MEDIA_ITEMS[0]; // p-1

  /** Keyboard sound test — sizeBytes null, short duration. */
  readonly itemNoSize: MediaItem = MOCK_MEDIA_ITEMS[7]; // p-8

  /** Live stream — both durationSec and sizeBytes null. */
  readonly itemUnknown: MediaItem = MOCK_MEDIA_ITEMS[10]; // m-11

  /** Very long title. */
  readonly itemLongTitle: MediaItem = MOCK_MEDIA_ITEMS[11]; // m-12

  // ── State signals ────────────────────────────────────────────────────────────
  readonly preSelectSelected = signal(false);
  readonly optionSelectSelected = signal(false);
  readonly optionSelectAppliedSelected = signal(true);
}
