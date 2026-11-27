import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { HistoryService } from './history.service';
import { ApiService } from './api.service';
import { DownloadItem, DownloadOptionsCatalog, MediaItem } from '@core/models';

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

const HISTORY_ITEM: DownloadItem & { finishedAt: string } = {
  ...ITEM,
  status: 'done',
  progress: 100,
  downloadedBytes: 41943040,
  totalBytes: 41943040,
  speedBps: null,
  etaSec: null,
  settings: {
    mode: 'video+audio',
    quality: '1080p',
    format: 'mp4',
    bitrate: 192,
    captions: { enabled: false, separateFile: false },
  },
  priority: 1,
  finishedAt: '2026-11-27T14:00:00.000Z',
};

let historySubject: Subject<DownloadItem[]>;
let historyMock = vi.fn();

describe('HistoryService', () => {
  let service!: HistoryService;

  beforeEach(() => {
    historySubject = new Subject<DownloadItem[]>();
    historyMock = vi.fn().mockReturnValue(historySubject);
    TestBed.configureTestingModule({
      providers: [
        HistoryService,
        {
          provide: ApiService,
          useFactory: () => ({ history: historyMock }) as unknown as ApiService,
        },
      ],
    });
    service = TestBed.inject(HistoryService);
  });

  it('load: status goes loading -> ready and items are set', () => {
    service.load();
    expect(service.status()).toBe('loading');
    historySubject.next([HISTORY_ITEM]);
    expect(service.status()).toBe('ready');
    expect(service.items()).toEqual([HISTORY_ITEM]);
    expect(historyMock).toHaveBeenCalled();
  });

  it('load error sets status to error', () => {
    service.load();
    expect(service.status()).toBe('loading');
    historySubject.error(new Error('boom'));
    expect(service.status()).toBe('error');
  });

  it('drop removes the entry', () => {
    service.load();
    historySubject.next([HISTORY_ITEM]);
    expect(service.items()).toHaveLength(1);

    service.drop('m-1');
    expect(service.items()).toEqual([]);
    expect(service.items().map((i) => i.id)).not.toContain('m-1');
  });
});
