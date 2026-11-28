import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DownloadService } from './download.service';
import { ApiService } from './api.service';
import { NavigationService } from './navigation.service';
import {
  DownloadAction,
  DownloadRequest,
  DownloadSettings,
  DownloadOptionsCatalog,
  MediaItem,
} from '@core/models';

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

let startDownloadsMock = vi.fn();
let controlMock = vi.fn();
let resetFlowMock = vi.fn();

describe('DownloadService', () => {
  let service!: DownloadService;

  beforeEach(() => {
    startDownloadsMock = vi.fn().mockReturnValue(of(undefined));
    controlMock = vi.fn().mockReturnValue(of(undefined));
    resetFlowMock = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        DownloadService,
        { provide: NavigationService, useValue: { resetFlow: resetFlowMock } },
        {
          provide: ApiService,
          useFactory: () =>
            ({
              startDownloads: startDownloadsMock,
              control: controlMock,
            }) as unknown as ApiService,
        },
      ],
    });
    service = TestBed.inject(DownloadService);
  });

  it('start forwards to api.startDownloads and resets flow', () => {
    const request: DownloadRequest = { item: ITEM, settings: SETTINGS };
    service.start([request]).subscribe();
    expect(startDownloadsMock).toHaveBeenCalledWith([request]);
    expect(resetFlowMock).toHaveBeenCalledTimes(1);
  });

  it('control forwards pause to api.control', () => {
    service.control('pause', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('pause', ['dl-1']);
  });

  it('control forwards resume to api.control', () => {
    service.control('resume', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('resume', ['dl-1']);
  });

  it('control forwards cancel to api.control', () => {
    service.control('cancel', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('cancel', ['dl-1']);
  });

  it('control forwards retry to api.control', () => {
    service.control('retry', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('retry', ['dl-1']);
  });

  it('control forwards remove to api.control', () => {
    service.control('remove', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('remove', ['dl-1']);
  });

  it('control forwards prioritize to api.control', () => {
    service.control('prioritize', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('prioritize', ['dl-1']);
  });

  it('control forwards dismiss to api.control', () => {
    service.control('dismiss', ['dl-1']).subscribe();
    expect(controlMock).toHaveBeenCalledWith('dismiss', ['dl-1']);
  });
});
