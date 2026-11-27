import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'plus'
  | 'x'
  | 'pause'
  | 'play'
  | 'check'
  | 'retry'
  | 'arrow-down'
  | 'arrow-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'trash'
  | 'warning'
  | 'moon'
  | 'sun'
  | 'search';

interface IconDefinition {
  filled?: boolean;
  paths?: readonly string[];
  rects?: readonly { x: number; y: number; width: number; height: number; rx?: number }[];
  circles?: readonly { cx: number; cy: number; r: number; filled?: boolean }[];
}

const ICONS: Record<IconName, IconDefinition> = {
  plus: {
    paths: ['M12 5v14', 'M5 12h14'],
  },
  x: {
    paths: ['M18 6L6 18', 'M6 6l12 12'],
  },
  pause: {
    filled: true,
    rects: [
      { x: 6, y: 5, width: 4, height: 14, rx: 1 },
      { x: 14, y: 5, width: 4, height: 14, rx: 1 },
    ],
  },
  play: {
    filled: true,
    paths: ['M7 5l12 7-12 7V5z'],
  },
  check: {
    paths: ['M5 12.5l4.5 4.5L19 7.5'],
  },
  retry: {
    paths: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5'],
  },
  'arrow-down': {
    paths: ['M12 5v14', 'M5 12l7 7 7-7'],
  },
  'arrow-up': {
    paths: ['M12 19V5', 'M5 12l7-7 7 7'],
  },
  'chevron-left': {
    paths: ['M15 18l-6-6 6-6'],
  },
  'chevron-right': {
    paths: ['M9 18l6-6-6-6'],
  },
  trash: {
    paths: [
      'M3 6h18',
      'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2',
      'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
      'M10 11v6',
      'M14 11v6',
    ],
  },
  warning: {
    paths: [
      'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      'M12 9v4',
    ],
    circles: [{ cx: 12, cy: 17, r: 0.75, filled: true }],
  },
  moon: {
    paths: ['M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'],
  },
  sun: {
    circles: [{ cx: 12, cy: 12, r: 4 }],
    paths: [
      'M12 2v2',
      'M12 20v2',
      'M4.93 4.93l1.41 1.41',
      'M17.66 17.66l1.41 1.41',
      'M2 12h2',
      'M20 12h2',
      'M4.93 19.07l1.41-1.41',
      'M17.66 6.34l1.41-1.41',
    ],
  },
  search: {
    circles: [{ cx: 11, cy: 11, r: 7 }],
    paths: ['M21 21l-4.35-4.35'],
  },
};

@Component({
  selector: 'd4m-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly stroke = input(2);

  protected readonly def = computed(() => ICONS[this.name()]);
}
