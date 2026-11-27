import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MOCK_CATALOG, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { DownloadSettings } from '@core/models';
import { DownloadOptionsComponent } from '@shared/components/download-options';

@Component({
  selector: 'd4m-download-options-demo',
  imports: [DownloadOptionsComponent],
  template: `
    <h2>Download options</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Stacked: video+audio (MOCK_CATALOG)</figcaption>
        <d4m-download-options [(settings)]="videoAudioSettings" [catalog]="catalog" />
      </figure>
      <figure>
        <figcaption>Stacked: audio-only</figcaption>
        <d4m-download-options [(settings)]="audioOnlySettings" [catalog]="catalog" />
      </figure>
      <figure>
        <figcaption>Stacked: video-only</figcaption>
        <d4m-download-options [(settings)]="videoOnlySettings" [catalog]="catalog" />
      </figure>
      <figure>
        <figcaption>layout="contents" inside 2-column grid</figcaption>
        <div
          style="
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            grid-template-areas: 'mode mode' 'quality format' 'captions captions' 'bitrate bitrate';
          "
        >
          <d4m-download-options
            layout="contents"
            [(settings)]="contentsSettings"
            [catalog]="catalog"
          />
        </div>
      </figure>
      <figure>
        <figcaption>hiddenFields (hiding captions &amp; bitrate)</figcaption>
        <d4m-download-options
          [(settings)]="hiddenSettings"
          [catalog]="catalog"
          [hiddenFields]="['captions', 'bitrate']"
        />
      </figure>
      <figure>
        <figcaption>
          Narrow per-video catalog (MOCK_PLAYLIST_ITEMS[3].catalog, clamps 2160p → 1080p)
        </figcaption>
        <d4m-download-options [(settings)]="narrowSettings" [catalog]="narrowCatalog" />
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadOptionsDemoComponent {
  protected readonly catalog = MOCK_CATALOG;
  protected readonly narrowCatalog = MOCK_PLAYLIST_ITEMS[3].catalog!;

  protected readonly videoAudioSettings = signal<DownloadSettings>({
    mode: 'video+audio',
    quality: '1080p',
    format: 'mp4',
    bitrate: 192,
    captions: { enabled: false, separateFile: false },
  });

  protected readonly audioOnlySettings = signal<DownloadSettings>({
    mode: 'audio-only',
    quality: null,
    format: 'mp3',
    bitrate: 192,
    captions: { enabled: false, separateFile: false },
  });

  protected readonly videoOnlySettings = signal<DownloadSettings>({
    mode: 'video-only',
    quality: '1080p',
    format: 'mp4',
    bitrate: null,
    captions: { enabled: false, separateFile: false },
  });

  protected readonly contentsSettings = signal<DownloadSettings>({
    mode: 'video+audio',
    quality: '1080p',
    format: 'mp4',
    bitrate: 192,
    captions: { enabled: false, separateFile: false },
  });

  protected readonly hiddenSettings = signal<DownloadSettings>({
    mode: 'video+audio',
    quality: '1080p',
    format: 'mp4',
    bitrate: 192,
    captions: { enabled: false, separateFile: false },
  });

  protected readonly narrowSettings = signal<DownloadSettings>({
    mode: 'video+audio',
    quality: '2160p',
    format: 'mp4',
    bitrate: 320,
    captions: { enabled: false, separateFile: false },
  });
}
