import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TagVariant = 'default' | 'applied';

@Component({
  selector: 'd4m-tag',
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  readonly text = input.required<string>();
  readonly variant = input<TagVariant>('default');
}
