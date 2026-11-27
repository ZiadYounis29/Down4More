import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FetchInfoService } from './fetch-info.service';
import { ApiService } from './api.service';
import { DownloadOptionsCatalog, FetchResult, MediaItem } from '@core/models';

const CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

const ITEM: MediaItem = {
  id: 'm-1',
  url: 'https://youtube.com/watch?v=abc',
  title: 'Test video',
  thumbnailUrl: null,
  durationSec: 120,
  channelName: 'Down4More Demo',
  sizeBytes: 41943040,
};

const RESULT: FetchResult = {
  kind: 'single',
  items: [ITEM],
  catalog: CATALOG,
  failed: [],
};

let fetchInfoMock = vi.fn();

describe('FetchInfoService', () => {
  let service!: FetchInfoService;

  beforeEach(() => {
    fetchInfoMock = vi.fn().mockReturnValue(of(RESULT));
    TestBed.configureTestingModule({
      providers: [
        FetchInfoService,
        {
          provide: ApiService,
          useFactory: () => ({ fetchInfo: fetchInfoMock }) as unknown as ApiService,
        },
      ],
    });
    service = TestBed.inject(FetchInfoService);
  });

  it('sets lastResult on success and calls fetchInfo with the urls', () => {
    fetchInfoMock.mockReturnValue(of(RESULT));
    let received: FetchResult | null = null;
    service.load(['https://youtube.com/watch?v=abc']).subscribe((r) => {
      received = r;
    });
    expect(fetchInfoMock).toHaveBeenCalledWith(['https://youtube.com/watch?v=abc']);
    expect(received).toBe(RESULT);
    expect(service.lastResult()).toBe(RESULT);
  });
});
