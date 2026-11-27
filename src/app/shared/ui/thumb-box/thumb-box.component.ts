import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { IconComponent } from '@shared/ui/icon';

export type ThumbBoxSize = 'row' | 'single' | 'preview';

const ICON_SIZES: Record<ThumbBoxSize, number> = {
  row: 26,
  single: 34,
  preview: 40,
};

@Component({
  selector: 'd4m-thumb-box',
  imports: [IconComponent],
  templateUrl: './thumb-box.component.html',
  styleUrl: './thumb-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbBoxComponent {
  readonly src = input<string | null>(null);
  readonly size = input<ThumbBoxSize>('row');
  readonly bordered = input(true);
  readonly alt = input('');

  private readonly failedSrc = signal<string | null>(null);

  protected readonly showImage = computed(() => {
    const s = this.src();
    return !!s && this.failedSrc() !== s;
  });

  protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);

  protected onImgError(): void {
    this.failedSrc.set(this.src());
  }
}
