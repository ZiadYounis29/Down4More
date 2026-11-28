import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { DownloadSettings, FetchResult, FrameSizeSettings, TrimSegment } from '@core/models';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { defaultDownloadSettings, sanitizeName } from '@core/utils';
import { defaultFrameSizeSettings } from './components/frame-size';

@Injectable({ providedIn: 'root' })
export class SingleStateService {
  private readonly fetchInfo = inject(FetchInfoService);

  private readonly result = computed(() => this.fetchInfo.lastResult()!);
  readonly item = computed(() => this.result().items[0]);
  readonly catalog = computed(() => this.item().catalog ?? this.result().catalog);

  readonly settings = linkedSignal<FetchResult, DownloadSettings>({
    source: this.result,
    computation: (r) => defaultDownloadSettings(r.items[0].catalog ?? r.catalog),
  });

  readonly fileName = linkedSignal<FetchResult, string>({
    source: this.result,
    computation: (r) => sanitizeName(r.items[0].title),
  });

  readonly frameSizeOn = linkedSignal<FetchResult, boolean>({
    source: this.result,
    computation: () => false,
  });

  readonly frameSize = linkedSignal<FetchResult, FrameSizeSettings>({
    source: this.result,
    computation: () => defaultFrameSizeSettings(),
  });

  readonly trimOn = linkedSignal<FetchResult, boolean>({
    source: this.result,
    computation: () => false,
  });

  readonly segments = linkedSignal<FetchResult, TrimSegment[]>({
    source: this.result,
    computation: () => [],
  });
}
