import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ProgressService } from './progress.service';
import { ApiService } from './api.service';
import { DownloadItem, DownloadOptionsCatalog, DownloadSettings, MediaItem } from '@core/models';

const CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

const SETTINGS: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
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

const ITEM_DOWNLOAD: DownloadItem = {
  ...ITEM,
  status: 'queued',
  progress: 0,
  downloadedBytes: 0,
  totalBytes: null,
  speedBps: null,
  etaSec: null,
  settings: SETTINGS,
  priority: 1,
};

let downloadsSubject: BehaviorSubject<DownloadItem[]>;
let downloadsMock = vi.fn();

describe('ProgressService', () => {
  let service!: ProgressService;

  beforeEach(() => {
    downloadsSubject = new BehaviorSubject<DownloadItem[]>([ITEM_DOWNLOAD]);
    downloadsMock = vi.fn().mockImplementation(() => downloadsSubject);
    TestBed.configureTestingModule({
      providers: [
        ProgressService,
        {
          provide: ApiService,
          useFactory: () => ({ downloads$: downloadsMock }) as unknown as ApiService,
        },
      ],
    });
    service = TestBed.inject(ProgressService);
  });

  it('starts with the initial value from the api', () => {
    expect(service.items()).toEqual([ITEM_DOWNLOAD]);
  });

  it('emits updated items from the api after the auditTime throttle', async () => {
    expect(service.items()).toEqual([ITEM_DOWNLOAD]);

    downloadsSubject.next([]);
    expect(service.items()).toEqual([ITEM_DOWNLOAD]); // auditTime has not fired yet

    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(service.items()).toEqual([]);
  });
});
