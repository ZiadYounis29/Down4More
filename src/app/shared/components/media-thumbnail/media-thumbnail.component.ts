import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  computed,
} from '@angular/core';
import { MediaItem } from '@core/models';
import { formatDuration, formatSize } from '@core/utils';
import { CheckboxComponent } from '@shared/ui/checkbox';
import { TagComponent } from '@shared/ui/tag';
import { ThumbBoxComponent } from '@shared/ui/thumb-box';

@Component({
  selector: 'd4m-media-thumbnail',
  templateUrl: './media-thumbnail.component.html',
  styleUrl: './media-thumbnail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxComponent, TagComponent, ThumbBoxComponent],
})
export class MediaThumbnailComponent {
  /** The media item to display. */
  readonly item = input.required<MediaItem>();

  /** Display variant. */
  readonly variant = input.required<'single' | 'pre-select' | 'option-select'>();

  /** Whether this row is selected (pre-select / option-select only). */
  readonly selected = model(false);

  /** Whether to show the checkbox. */
  readonly showCheckbox = input(true);

  /** Reserved — not used by current playlist flow. */
  readonly active = input(false);

  /**
   * Text of the applied-settings tag (option-select only).
   * null → show "Default" tag. A string → show it as an applied (red) tag.
   */
  readonly appliedTag = input<string | null>(null);

  /** Show a skeleton while info is loading. */
  readonly loading = input(false);

  /**
   * When set (not undefined), overrides item.sizeBytes for the displayed size.
   * null → show '—'.
   */
  readonly sizeOverride = input<number | null | undefined>(undefined);

  /** Reserved — not used by current playlist flow. */
  readonly activate = output<string>();

  // ── Computed display values ─────────────────────────────────────────────────

  protected readonly displayDuration = computed(() =>
    formatDuration(this.item().durationSec),
  );

  protected readonly displaySize = computed(() => {
    const override = this.sizeOverride();
    const bytes = override !== undefined ? override : (this.item().sizeBytes ?? null);
    return formatSize(bytes);
  });

  protected readonly tagText = computed(() => this.appliedTag() ?? 'Default');
  protected readonly tagVariant = computed(() =>
    this.appliedTag() != null ? ('applied' as const) : ('default' as const),
  );

  /** Meta line for compact row: "40 MB · 12:48" (option-select) or "12:48" (pre-select). */
  protected readonly compactMeta = computed(() => {
    const dur = this.displayDuration();
    if (this.variant() === 'pre-select') return dur;
    const size = this.displaySize();
    return `${size} · ${dur}`;
  });

  // ── Interaction ─────────────────────────────────────────────────────────────

  protected toggleSelected(): void {
    this.selected.set(!this.selected());
  }
}
