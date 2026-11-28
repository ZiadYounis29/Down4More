import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FrameCropRegion, FrameSizeSettings } from '@core/models';
import { IconComponent } from '@shared/ui/icon';
import { TogglePanelComponent } from '../toggle-panel';

export type FillType = FrameSizeSettings['fill'];
export type AspectPreset = FrameSizeSettings['aspect'];

const SOURCE_ASPECT = 16 / 9;
const MIN_CROP_SIZE = 0.15;

export type EdgeHandle = 'n' | 's' | 'e' | 'w';
export type CornerHandle = 'nw' | 'ne' | 'sw' | 'se';
export type DragMode = 'move' | EdgeHandle | CornerHandle;

const EDGES: readonly EdgeHandle[] = ['n', 's', 'e', 'w'];
const CORNERS: readonly CornerHandle[] = ['nw', 'ne', 'sw', 'se'];

const FILL_OPTIONS: readonly { value: FillType; label: string }[] = [
  { value: 'crop', label: 'Crop' },
  { value: 'blur', label: 'Blur' },
  { value: 'black', label: 'Black' },
];

const ASPECT_OPTIONS: readonly { value: Exclude<AspectPreset, 'custom'>; label: string; ratio: number | null }[] = [
  { value: 'original', label: 'Original', ratio: null },
  { value: '16:9', label: '16:9', ratio: 16 / 9 },
  { value: '21:9', label: '21:9', ratio: 21 / 9 },
  { value: '4:5', label: '4:5', ratio: 4 / 5 },
  { value: '9:16', label: '9:16', ratio: 9 / 16 },
  { value: '1:1', label: '1:1', ratio: 1 },
  { value: '4:3', label: '4:3', ratio: 4 / 3 },
];

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function ratioFromCrop(crop: FrameCropRegion): { customW: number; customH: number } {
  const ratio = (crop.width * SOURCE_ASPECT) / Math.max(0.01, crop.height);
  if (ratio >= 1) {
    return { customW: round1(ratio * 9), customH: 9 };
  }
  return { customW: 9, customH: round1(9 / ratio) };
}

function fitCropForRatio(ratio: number | null): FrameCropRegion {
  if (!ratio || ratio <= 0) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  const rel = ratio / SOURCE_ASPECT;
  const width = rel >= 1 ? 1 : round4(rel);
  const height = rel >= 1 ? round4(1 / rel) : 1;
  return {
    x: round4((1 - width) / 2),
    y: round4((1 - height) / 2),
    width,
    height,
  };
}

export function defaultFrameSizeSettings(): FrameSizeSettings {
  return {
    fill: 'crop',
    aspect: 'original',
    customW: 16,
    customH: 9,
    crop: { x: 0, y: 0, width: 1, height: 1 },
  };
}

@Component({
  selector: 'd4m-frame-size',
  imports: [TogglePanelComponent, IconComponent],
  templateUrl: './frame-size.component.html',
  styleUrl: './frame-size.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrameSizeComponent {
  readonly open = model(false);
  readonly value = model<FrameSizeSettings>(defaultFrameSizeSettings());
  readonly thumbnailUrl = input<string | null>(null);
  readonly disabled = input(false);

  private readonly previewRef = viewChild<ElementRef<HTMLElement>>('preview');
  protected readonly dragging = signal<DragMode | null>(null);

  private dragStartClientX = 0;
  private dragStartClientY = 0;
  private dragStartCrop: FrameCropRegion = { x: 0, y: 0, width: 1, height: 1 };

  protected readonly fillOptions = FILL_OPTIONS;
  protected readonly aspectOptions = ASPECT_OPTIONS;
  protected readonly edges = EDGES;
  protected readonly corners = CORNERS;

  protected readonly crop = computed<FrameCropRegion>(
    () => this.value().crop ?? { x: 0, y: 0, width: 1, height: 1 },
  );

  protected readonly cropSummary = computed(() => {
    const c = this.crop();
    return `${Math.round(c.x * 100)}%, ${Math.round(c.y * 100)}% · ${Math.round(c.width * 100)}×${Math.round(c.height * 100)}%`;
  });

  protected setFill(fill: FillType): void {
    this.value.update((v) => ({ ...v, fill }));
  }

  protected setAspect(aspect: AspectPreset): void {
    this.value.update((v) => {
      const ratio = this.resolveRatio(aspect, v.customW, v.customH);
      return { ...v, aspect, crop: fitCropForRatio(ratio) };
    });
  }

  protected onCustomChange(dim: 'customW' | 'customH', event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const num = Number.isFinite(raw) && raw > 0 ? round1(raw) : undefined;
    this.value.update((v) => {
      const nextW = dim === 'customW' ? num : v.customW;
      const nextH = dim === 'customH' ? num : v.customH;
      const ratio = this.resolveRatio('custom', nextW, nextH);
      return {
        ...v,
        aspect: 'custom',
        [dim]: num,
        crop: fitCropForRatio(ratio),
      };
    });
  }

  protected onFramePointerDown(mode: DragMode, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.dragging.set(mode);
    this.dragStartClientX = event.clientX;
    this.dragStartClientY = event.clientY;
    this.dragStartCrop = { ...this.crop() };
  }

  protected onFramePointerMove(event: PointerEvent): void {
    const mode = this.dragging();
    if (!mode) return;
    const preview = this.previewRef()?.nativeElement;
    if (!preview) return;
    const rect = preview.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dx = (event.clientX - this.dragStartClientX) / rect.width;
    const dy = (event.clientY - this.dragStartClientY) / rect.height;
    const start = this.dragStartCrop;

    if (mode === 'move') {
      const x = round4(Math.min(1 - start.width, Math.max(0, start.x + dx)));
      const y = round4(Math.min(1 - start.height, Math.max(0, start.y + dy)));
      this.setCrop({ ...start, x, y });
      return;
    }

    if (this.isCorner(mode)) {
      this.setCrop(this.resizeCorner(start, mode, dx, dy));
      return;
    }

    this.resizeEdge(start, mode, dx, dy);
  }

  protected onFramePointerUp(event: PointerEvent): void {
    if (this.dragging()) {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      this.dragging.set(null);
    }
  }

  protected onFrameKeyDown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 0.1 : 0.02;
    let dx = 0;
    let dy = 0;
    if (event.key === 'ArrowLeft') dx = -step;
    else if (event.key === 'ArrowRight') dx = step;
    else if (event.key === 'ArrowUp') dy = -step;
    else if (event.key === 'ArrowDown') dy = step;
    else return;

    event.preventDefault();
    const c = this.crop();
    const x = round4(Math.min(1 - c.width, Math.max(0, c.x + dx)));
    const y = round4(Math.min(1 - c.height, Math.max(0, c.y + dy)));
    this.setCrop({ ...c, x, y });
  }

  private isCorner(mode: DragMode): mode is CornerHandle {
    return mode === 'nw' || mode === 'ne' || mode === 'sw' || mode === 'se';
  }

  /** Scale the crop box uniformly from the opposite corner, preserving aspect ratio. */
  private resizeCorner(
    start: FrameCropRegion,
    corner: CornerHandle,
    dx: number,
    dy: number,
  ): FrameCropRegion {
    const xSign = corner.includes('e') ? 1 : -1;
    const ySign = corner.includes('s') ? 1 : -1;
    const anchorX = xSign > 0 ? start.x : start.x + start.width;
    const anchorY = ySign > 0 ? start.y : start.y + start.height;
    const maxW = xSign > 0 ? 1 - anchorX : anchorX;
    const maxH = ySign > 0 ? 1 - anchorY : anchorY;

    const scaleX = (start.width + xSign * dx) / start.width;
    const scaleY = (start.height + ySign * dy) / start.height;
    const rawScale = (scaleX + scaleY) / 2;
    const minScale = Math.max(MIN_CROP_SIZE / start.width, MIN_CROP_SIZE / start.height);
    const maxScale = Math.min(maxW / start.width, maxH / start.height);
    const scale = Math.min(maxScale, Math.max(minScale, rawScale));

    const width = round4(start.width * scale);
    const height = round4(start.height * scale);
    const x = xSign > 0 ? anchorX : round4(anchorX - width);
    const y = ySign > 0 ? anchorY : round4(anchorY - height);
    return { x, y, width, height };
  }

  /** Resize a single edge freely, updating aspect to custom with 1-decimal ratio. */
  private resizeEdge(
    start: FrameCropRegion,
    edge: EdgeHandle,
    dx: number,
    dy: number,
  ): void {
    let { x, y, width, height } = start;

    if (edge === 'e') {
      width = round4(Math.max(MIN_CROP_SIZE, Math.min(1 - start.x, start.width + dx)));
    } else if (edge === 's') {
      height = round4(Math.max(MIN_CROP_SIZE, Math.min(1 - start.y, start.height + dy)));
    } else if (edge === 'w') {
      const maxX = start.x + start.width - MIN_CROP_SIZE;
      x = round4(Math.max(0, Math.min(maxX, start.x + dx)));
      width = round4(start.x + start.width - x);
    } else if (edge === 'n') {
      const maxY = start.y + start.height - MIN_CROP_SIZE;
      y = round4(Math.max(0, Math.min(maxY, start.y + dy)));
      height = round4(start.y + start.height - y);
    }

    const nextCrop: FrameCropRegion = { x, y, width, height };
    const { customW, customH } = ratioFromCrop(nextCrop);
    this.value.update((v) => ({
      ...v,
      aspect: 'custom',
      customW,
      customH,
      crop: nextCrop,
    }));
  }

  private setCrop(crop: FrameCropRegion): void {
    this.value.update((v) => ({ ...v, crop }));
  }

  private resolveRatio(aspect: AspectPreset, customW?: number, customH?: number): number | null {
    if (aspect === 'custom') {
      return customW && customW > 0 && customH && customH > 0 ? customW / customH : null;
    }
    return ASPECT_OPTIONS.find((o) => o.value === aspect)?.ratio ?? null;
  }
}
