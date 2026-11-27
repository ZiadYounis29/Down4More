import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagComponent } from '@shared/ui/tag';
import { UrlEntry, MAX_LINKS } from '../url-entry.model';

@Component({
  selector: 'd4m-url-list',
  templateUrl: './url-list.component.html',
  styleUrl: './url-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TagComponent],
})
export class UrlListComponent {
  readonly entries = input.required<UrlEntry[]>();
  readonly disabled = input<boolean>(false);

  readonly remove = output<string>();
  readonly clear = output<void>();

  readonly columnCount = computed(() => {
    const n = this.entries().length;
    return n >= 4 ? 2 : 1;
  });

  readonly rowsPerColumn = computed(() => {
    const n = this.entries().length;
    return Math.max(3, Math.ceil(n / 2));
  });

  readonly isTwoCol = computed(() => this.entries().length >= 4);

  readonly columnEntries = computed(() => {
    const entries = this.entries();
    const n = entries.length;
    if (n < 4) return [entries];
    const rowsPerCol = Math.max(3, Math.ceil(n / 2));
    return [entries.slice(0, rowsPerCol), entries.slice(rowsPerCol)];
  });

  onRemove(id: string): void {
    this.remove.emit(id);
  }

  onClear(): void {
    this.clear.emit();
  }

  trackById(_index: number, entry: UrlEntry): string {
    return entry.id;
  }

  globalIndex(colIndex: number, rowIndex: number): number {
    if (colIndex === 0) return rowIndex + 1;
    return (this.columnEntries()[0]?.length ?? 0) + rowIndex + 1;
  }

  typeLabel(kind: UrlEntry['kind']): string {
    return kind === 'video' ? 'Video' : kind === 'playlist' ? 'Playlist' : 'Link';
  }
}
