import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MOCK_CATALOG, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { DownloadSettings } from '@core/models';
// UNRESOLVED IMPORT (not yet on main):
// import { DownloadOptionsComponent } from '@shared/components/download-options';

@Component({
  selector: 'd4m-download-options-demo',
  imports: [],
  template: `
    <h2>Download options</h2>
    <section class="demo-grid">
      <figure>
        <figcaption>Stacked: video+audio (MOCK_CATALOG)</figcaption>
        <pre
          >{{ videoAudioSettings().mode }} | {{ videoAudioSettings().quality }} | {{
            videoAudioSettings().format
          }} | {{ videoAudioSettings().bitrate }} kbps</pre>
      </figure>
      <figure>
        <figcaption>Stacked: audio-only</figcaption>
        <pre
          >{{ audioOnlySettings().mode }} | {{ audioOnlySettings().format }} | {{
            audioOnlySettings().bitrate
          }} kbps</pre>
      </figure>
      <figure>
        <figcaption>Stacked: video-only</figcaption>
        <pre
          >{{ videoOnlySettings().mode }} | {{ videoOnlySettings().quality }} | {{
            videoOnlySettings().format
          }}</pre>
      </figure>
      <figure>
        <figcaption>layout="contents" inside 2-column grid</figcaption>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div>Mode</div>
          <div>Quality</div>
          <div>Format</div>
          <div>Bit-rate</div>
        </div>
      </figure>
      <figure>
        <figcaption>hiddenFields (hiding captions &amp; bitrate)</figcaption>
        <p>Mode, Quality, Format visible</p>
      </figure>
      <figure>
        <figcaption>
          Narrow per-video catalog (MOCK_PLAYLIST_ITEMS[3].catalog, clamps 2160p → 1080p)
        </figcaption>
        <pre>Catalog qualities: {{ narrowCatalog?.qualities?.join(', ') }}</pre>
      </figure>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadOptionsDemoComponent {
  protected readonly catalog = MOCK_CATALOG;
  protected readonly narrowCatalog = MOCK_PLAYLIST_ITEMS[3]?.catalog;

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
}
