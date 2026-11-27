import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { UrlKind } from '@core/utils';
import { IconComponent } from '@shared/ui/icon';
import { TagComponent } from '@shared/ui/tag';
import { UrlEntry } from '../../url-entry.model';

@Component({
  selector: 'd4m-url-list',
  imports: [IconComponent, TagComponent],
  templateUrl: './url-list.component.html',
  styleUrl: './url-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlListComponent {
  readonly entries = input.required<UrlEntry[]>();
  readonly disabled = input(false);

  readonly remove = output<string>();
  readonly clear = output<void>();

  protected readonly twoCol = computed(() => this.entries().length >= 4);
  protected readonly rowsPerCol = computed(() =>
    Math.max(3, Math.ceil(this.entries().length / 2)),
  );
  protected readonly countLabel = computed(() => {
    const n = this.entries().length;
    return `${n} ${n === 1 ? 'link' : 'links'}`;
  });

  protected kindLabel(kind: UrlKind): string {
    return kind === 'video' ? 'Video' : kind === 'playlist' ? 'Playlist' : 'Link';
  }
}
