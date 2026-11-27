import { ChangeDetectionStrategy, Component, computed, effect, input, model } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';
import type { DownloadOptionsCatalog, DownloadSettings, MediaMode } from '@core/models';
import { VideoAudioSelectComponent } from './video-audio-select';
import { QualityComponent } from './quality';
import { FormatComponent } from './format';
import { BitrateComponent } from './bitrate';
import { CaptionsComponent } from './captions';
// applyOptionRules is owned by P3 (@core/utils/apply-option-rules), not yet on main.
// Inline a minimal version here, referencing the spec signature; replace with the real import once P3 merges.
// import { applyOptionRules } from '@core/utils/apply-option-rules';

export type OptionField = 'mode' | 'quality' | 'format' | 'bitrate' | 'captions';
export type DownloadOptionsLayout = 'stacked' | 'contents';

/** Minimal inline implementation of applyOptionRules (spec: shared §6.4, Decisions §1.3, Per-Video §2.2).
 *  Replace body with: return applyOptionRules(settings, catalog) once P3 merges. */
function applyOptionRules(
  settings: DownloadSettings,
  catalog: DownloadOptionsCatalog,
): DownloadSettings {
  let { mode, quality, format, bitrate, captions } = settings;

  // 1. quality clamp (Per-Video §2.2)
  if (quality !== null && !catalog.qualities.includes(quality)) {
    quality = fallbackQuality(quality, catalog.qualities);
  }

  // 2. format: ensure it's valid for mode
  const validFormats = mode === 'audio-only' ? catalog.audioFormats : catalog.videoFormats;
  if (!validFormats.includes(format)) format = validFormats[0] ?? format;

  // 3. mode rules
  if (mode === 'audio-only') {
    quality = null;
    if (!catalog.audioFormats.includes(format)) format = catalog.audioFormats[0] ?? format;
    // audio-only forces separate file
    captions = { ...captions, separateFile: true };
  } else if (mode === 'video-only') {
    bitrate = null;
    if (!catalog.videoFormats.includes(format)) format = catalog.videoFormats[0] ?? format;
  } else {
    // video+audio — ensure bitrate is in catalog
    if (bitrate !== null) bitrate = nearestBitrate(bitrate, catalog.bitrates);
    else if (catalog.bitrates.length) bitrate = nearestBitrate(192, catalog.bitrates);
    if (!catalog.videoFormats.includes(format)) format = catalog.videoFormats[0] ?? format;
  }

  // separateFile only editable when captions enabled; turning captions off resets it
  if (!captions.enabled) captions = { ...captions, separateFile: false };

  return { mode, quality, format, bitrate, captions };
}

function nearestBitrate(wanted: number, available: number[]): number {
  if (!available.length) return wanted;
  return available.reduce((best, v) => (Math.abs(v - wanted) < Math.abs(best - wanted) ? v : best));
}

function fallbackQuality(wanted: string, available: string[]): string | null {
  if (!available.length) return null;
  if (available.includes(wanted)) return wanted;
  const rank = (q: string) => parseInt(q, 10);
  const w = rank(wanted);
  if (Number.isNaN(w)) return available[0];
  const lower = available.filter((q) => rank(q) < w).sort((a, b) => rank(b) - rank(a));
  if (lower.length) return lower[0];
  return available.slice().sort((a, b) => rank(a) - rank(b))[0];
}

@Component({
  selector: 'd4m-download-options',
  imports: [
    PanelComponent,
    VideoAudioSelectComponent,
    QualityComponent,
    FormatComponent,
    BitrateComponent,
    CaptionsComponent,
  ],
  templateUrl: './download-options.component.html',
  styleUrl: './download-options.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadOptionsComponent {
  readonly settings = model.required<DownloadSettings>();
  readonly catalog = input.required<DownloadOptionsCatalog>();
  readonly disabled = input(false);
  readonly hiddenFields = input<OptionField[]>([]);
  readonly columns = input<1 | 2>(2);
  readonly layout = input<DownloadOptionsLayout>('stacked');

  protected readonly mode = computed(() => this.settings().mode);
  protected readonly audioOnly = computed(() => this.mode() === 'audio-only');
  protected readonly videoOnly = computed(() => this.mode() === 'video-only');

  protected readonly formatOptions = computed(() =>
    this.audioOnly() ? this.catalog().audioFormats : this.catalog().videoFormats,
  );

  protected readonly isHidden = computed(() => {
    const h = new Set(this.hiddenFields());
    return (f: OptionField) => h.has(f);
  });

  protected readonly contentsMode = computed(() => this.layout() === 'contents');

  // Normalise settings whenever catalog changes
  constructor() {
    effect(() => {
      const cat = this.catalog();
      const current = this.settings();
      const normalised = applyOptionRules(current, cat);
      // only set if changed, to avoid loops
      if (JSON.stringify(normalised) !== JSON.stringify(current)) {
        this.settings.set(normalised);
      }
    });
  }

  protected patch(partial: Partial<DownloadSettings>): void {
    const next = applyOptionRules({ ...this.settings(), ...partial }, this.catalog());
    this.settings.set(next);
  }

  protected onMode(v: MediaMode): void {
    this.patch({ mode: v });
  }

  protected onQuality(v: string | null): void {
    this.patch({ quality: v });
  }

  protected onFormat(v: string): void {
    this.patch({ format: v });
  }

  protected onBitrate(v: number | null): void {
    this.patch({ bitrate: v });
  }

  protected onCaptions(v: { enabled: boolean; separateFile: boolean }): void {
    this.patch({ captions: v });
  }
}
