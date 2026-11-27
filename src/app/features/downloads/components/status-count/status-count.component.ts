import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export type StatusFilter = 'done' | 'downloading' | 'failed';

export interface StatusCounts {
  done: number;
  downloading: number;
  failed: number;
}

@Component({
  selector: 'd4m-status-count',
  imports: [],
  templateUrl: './status-count.component.html',
  styleUrl: './status-count.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusCountComponent {
  readonly counts = input.required<StatusCounts>();
  readonly value = model<StatusFilter | null>(null);

  protected formatCount(n: number): string {
    return n > 999 ? '999+' : String(n);
  }

  protected toggle(key: StatusFilter): void {
    this.value.set(this.value() === key ? null : key);
  }
}
