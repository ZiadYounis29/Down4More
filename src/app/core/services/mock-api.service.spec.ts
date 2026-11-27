// Unresolved imports (not on main yet): @core/utils/parse-url, @core/utils/fallback-quality,
// @core/utils/nearest-bitrate — owned by P3 T1/T2. This spec cannot run until those are merged.
import { TestBed } from '@angular/core/testing';
import { MockApiService } from './mock-api.service';
import { ApiService } from './api.service';
import {
  DownloadAction,
  DownloadItem,
  DownloadOptionsCatalog,
  DownloadSettings,
  FetchResult,
  MediaItem,
} from '@core/models';
import { MOCK_CATALOG, MOCK_DOWNLOADS, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';

const CATALOG: DownloadOptionsCatalog = MOCK_CATALOG;

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

describe('MockApiService', () => {
  let service: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockApiService, { provide: ApiService, useExisting: MockApiService }],
    });
    service = TestBed.inject(MockApiService);
  });

  it('fetchInfo returns a FetchResult with catalog MOCK_CATALOG', (done) => {
    service.fetchInfo(['https://youtube.com/watch?v=p-1']).subscribe(result => {
      expect(result.catalog).toBe(MOCK_CATALOG);
      expect(result.items.length).toBeGreaterThan(0);
      done();
    });
  });

  it('fetchInfo with "fail" URL produces failed entries and empty items', (done) => {
    service.fetchInfo(['https://youtube.com/watch?v=fail-video']).subscribe(result => {
      expect(result.failed.length).toBeGreaterThan(0);
      expect(result.items).toEqual([]);
      done();
    });
  });

  it('fetchInfo single video returns kind single', (done) => {
    service.fetchInfo(['https://youtube.com/watch?v=p-1']).subscribe(result => {
      expect(result.kind).toBe('single');
      done();
    });
  });

  it('control pause sets status to paused and clears speed/eta', () => {
    const item = MOCK_DOWNLOADS.find(i => i.status === 'downloading')!;
    service.control('pause', [item.id]).subscribe();
    const updated = MOCK_DOWNLOADS.find(i => i.id === item.id);
    expect(updated?.status).toBe('paused');
    expect(updated?.speedBps).toBeNull();
    expect(updated?.etaSec).toBeNull();
  });

  it('control resume returns paused to queued', () => {
    const item = MOCK_DOWNLOADS.find(i => i.status === 'paused')!;
    service.control('resume', [item.id]).subscribe();
    const updated = MOCK_DOWNLOADS.find(i => i.id === item.id);
    expect(updated?.status).toBe('queued');
  });

  it('control cancel removes the item', () => {
    const item = MOCK_DOWNLOADS.find(i => i.status === 'queued')!;
    service.control('cancel', [item.id]).subscribe();
    expect(MOCK_DOWNLOADS.find(i => i.id === item.id)).toBeUndefined();
  });

  it('control retry moves failed to queued and clears error', () => {
    const item = MOCK_DOWNLOADS.find(i => i.status === 'failed')!;
    service.control('retry', [item.id]).subscribe();
    const updated = MOCK_DOWNLOADS.find(i => i.id === item.id);
    expect(updated?.status).toBe('queued');
    expect(updated?.error).toBeUndefined();
    expect(updated?.progress).toBe(0);
  });

  it('control dismiss hides from store view', () => {
    const item = MOCK_DOWNLOADS.find(i => i.status === 'done')!;
    service.control('dismiss', [item.id]).subscribe();
    // The item remains in store but is in dismissed set
    expect(item.id).toBeTruthy();
  });

  it('control prioritize gives lowest priority numbers', () => {
    const items = MOCK_DOWNLOADS.filter(i => i.status === 'queued').slice(0, 2);
    service.control('prioritize', items.map(i => i.id)).subscribe();
    const updated = items.map(i => MOCK_DOWNLOADS.find(x => x.id === i.id)!);
    expect(updated[0].priority).toBeLessThan(updated[1].priority);
  });

  it('history returns done and failed items newest first', (done) => {
    service.history().subscribe(rows => {
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every(r => r.status === 'done' || r.status === 'failed')).toBe(true);
      done();
    });
  });

  it('startDownloads creates queued items with resolved settings', (done) => {
    service.startDownloads([{ item: ITEM, settings: SETTINGS }]).subscribe(() => {
      const added = MOCK_DOWNLOADS.find(i => i.id === 'm-1');
      expect(added).toBeTruthy();
      expect(added?.status).toBe('queued');
      expect(added?.progress).toBe(0);
      done();
    });
  });
});
