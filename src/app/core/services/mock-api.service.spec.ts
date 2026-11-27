import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_DOWNLOAD_SETTINGS,
  MOCK_CATALOG,
  MOCK_PLAYLIST_ITEMS,
} from '@core/mocks/mock-data';
import { DownloadItem } from '@core/models';
import { MockApiService } from './mock-api.service';

describe('MockApiService', () => {
  let service: MockApiService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockApiService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetchInfo handles single video, single playlist, multi-link batch, fail, big, and all failed', async () => {
    const singleP = firstValueFrom(service.fetchInfo(['https://youtube.com/watch?v=abc']));
    vi.advanceTimersByTime(600);
    const singleRes = await singleP;
    expect(singleRes.kind).toBe('single');
    expect(singleRes.items).toHaveLength(1);
    expect(singleRes.catalog).toEqual(MOCK_CATALOG);

    const plP = firstValueFrom(service.fetchInfo(['https://youtube.com/playlist?list=PL1']));
    vi.advanceTimersByTime(600);
    const plRes = await plP;
    expect(plRes.kind).toBe('playlist');
    expect(plRes.items.map((i) => i.title)).toEqual(MOCK_PLAYLIST_ITEMS.map((i) => i.title));

    const batchP = firstValueFrom(
      service.fetchInfo(['https://youtube.com/watch?v=1', 'https://youtube.com/watch?v=2']),
    );
    vi.advanceTimersByTime(600);
    const batchRes = await batchP;
    expect(batchRes.kind).toBe('playlist');
    expect(batchRes.items).toHaveLength(2);

    const bigP = firstValueFrom(service.fetchInfo(['https://youtube.com/playlist?list=big']));
    vi.advanceTimersByTime(600);
    const bigRes = await bigP;
    expect(bigRes.items).toHaveLength(300);

    const partialP = firstValueFrom(
      service.fetchInfo(['https://youtube.com/watch?v=ok', 'https://youtube.com/watch?v=fail']),
    );
    vi.advanceTimersByTime(600);
    const partialRes = await partialP;
    expect(partialRes.items).toHaveLength(1);
    expect(partialRes.failed).toHaveLength(1);

    const allFailP = firstValueFrom(service.fetchInfo(['https://youtube.com/watch?v=fail']));
    vi.advanceTimersByTime(600);
    const allFailRes = await allFailP;
    expect(allFailRes.items).toEqual([]);
    expect(allFailRes.failed).toHaveLength(1);
  });

  it('startDownloads resolves per-video unsupported quality to nearest lower', async () => {
    const p4 = MOCK_PLAYLIST_ITEMS[3]; // qualities: 1080p, 720p, 480p, 360p; bitrates: 96,128,160,192
    let latest: DownloadItem[] = [];
    const sub = service.downloads$().subscribe((list) => (latest = list));

    await firstValueFrom(
      service.startDownloads([
        {
          item: p4,
          settings: { ...DEFAULT_DOWNLOAD_SETTINGS, quality: '2160p', bitrate: 320 },
        },
      ]),
    );

    const created = latest.find((d) => d.title === p4.title && d.status === 'queued');
    expect(created).toBeTruthy();
    expect(created!.settings.quality).toBe('1080p');
    expect(created!.settings.bitrate).toBe(192);
    sub.unsubscribe();
  });

  it('obeys concurrency cap and transitions 100% -> processing (3 ticks) -> done in downloads$ and history', async () => {
    let latest: DownloadItem[] = [];
    const sub = service.downloads$().subscribe((list) => (latest = list));

    // Pause seeded active downloads so queue slots open up for our test item
    const activeIds = latest.filter((d) => d.status === 'downloading').map((d) => d.id);
    await firstValueFrom(service.control('pause', activeIds));

    const smallItem = { ...MOCK_PLAYLIST_ITEMS[0], id: 'fast-1', title: 'Fast Clip', sizeBytes: 1000 };
    await firstValueFrom(
      service.startDownloads([{ item: smallItem, settings: DEFAULT_DOWNLOAD_SETTINGS }]),
    );

    // Tick 1: starts downloading
    vi.advanceTimersByTime(1000);
    let fast = latest.find((d) => d.title === 'Fast Clip')!;
    expect(fast.status).toBe('downloading');

    // Tick 2: advances to 100% -> processing
    vi.advanceTimersByTime(1000);
    fast = latest.find((d) => d.title === 'Fast Clip')!;
    expect(fast.status).toBe('processing');

    // Ticks 3 & 4: still processing
    vi.advanceTimersByTime(2000);
    fast = latest.find((d) => d.title === 'Fast Clip')!;
    expect(fast.status).toBe('processing');

    // Tick 5: transitions to done and appears in history with same id
    vi.advanceTimersByTime(1000);
    fast = latest.find((d) => d.title === 'Fast Clip')!;
    expect(fast.status).toBe('done');
    expect(fast.finishedAt).toBeTruthy();

    const hist = await firstValueFrom(service.history('Fast Clip'));
    expect(hist).toHaveLength(1);
    expect(hist[0].id).toBe(fast.id);
    expect(hist[0].finishedAt).toBe(fast.finishedAt);

    sub.unsubscribe();
  });

  it('control dismiss keeps history, cancel removes everywhere, and retry moves failed back to queued', async () => {
    let latest: DownloadItem[] = [];
    const sub = service.downloads$().subscribe((list) => (latest = list));

    const doneItem = latest.find((d) => d.status === 'done')!;
    const failedItem = latest.find((d) => d.status === 'failed')!;
    const activeItem = latest.find((d) => d.status === 'downloading')!;

    await firstValueFrom(service.control('dismiss', [doneItem.id]));
    expect(latest.some((d) => d.id === doneItem.id)).toBe(false);
    const histAfterDismiss = await firstValueFrom(service.history());
    expect(histAfterDismiss.some((d) => d.id === doneItem.id)).toBe(true);

    await firstValueFrom(service.control('cancel', [activeItem.id]));
    expect(latest.some((d) => d.id === activeItem.id)).toBe(false);

    await firstValueFrom(service.control('retry', [failedItem.id]));
    const retried = latest.find((d) => d.id === failedItem.id)!;
    expect(retried.status).toBe('queued');
    expect(retried.error).toBeUndefined();
    const histAfterRetry = await firstValueFrom(service.history());
    expect(histAfterRetry.some((d) => d.id === failedItem.id)).toBe(false);

    sub.unsubscribe();
  });
});
