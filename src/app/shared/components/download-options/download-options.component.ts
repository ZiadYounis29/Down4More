import { ChangeDetectionStrategy, Component, computed, effect, input, model } from '@angular/core';
import { PanelComponent } from '@shared/ui/panel';
import type { DownloadOptionsCatalog, DownloadSettings, MediaMode } from '@core/models';
import { VideoAudioSelectComponent } from './video-audio-select';
import { QualityComponent } from './quality';
import { FormatComponent } from './format';
import { BitrateComponent } from './bitrate';
import { CaptionsComponent } from './captions';
import { applyOptionRules } from '@core/utils';

export type OptionField = 'mode' | 'quality' | 'format' | 'bitrate' | 'captions';
export type DownloadOptionsLayout = 'stacked' | 'contents';

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
