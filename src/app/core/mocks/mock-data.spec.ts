import {
  MOCK_CATALOG,
  MOCK_DOWNLOADS,
  MOCK_HISTORY,
  MOCK_MEDIA_ITEMS,
  MOCK_PLAYLIST_ITEMS,
  DEFAULT_DOWNLOAD_SETTINGS,
  seedStore,
  generatePlaylistItems,
} from './mock-data';
import { DownloadOptionsCatalog } from '@core/models';

const FLOW_SIZES: { id: string; sizeBytes: number; durationSec: number }[] = [
  { id: 'p-1', sizeBytes: 41943040, durationSec: 768 },
  { id: 'p-2', sizeBytes: 29360128, durationSec: 495 },
  { id: 'p-3', sizeBytes: 117440512, durationSec: 1443 },
  { id: 'p-4', sizeBytes: 100663296, durationSec: 7200 },
  { id: 'p-5', sizeBytes: 67108864, durationSec: 207 },
  { id: 'p-6', sizeBytes: 76546048, durationSec: 2472 },
  { id: 'p-7', sizeBytes: 19922944, durationSec: 350 },
  { id: 'p-8', sizeBytes: null as unknown as number, durationSec: 129 },
  { id: 'p-9', sizeBytes: 213909504, durationSec: null as unknown as number },
];

describe('mock-data', () => {
  it('MOCK_CATALOG has the expected qualities, formats and bitrates', () => {
    const expected: DownloadOptionsCatalog = {
      qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
      videoFormats: ['mp4', 'mkv', 'webm'],
      audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
      bitrates: [96, 128, 160, 192, 256, 320],
    };
    expect(MOCK_CATALOG).toEqual(expected);
  });

  it('DEFAULT_DOWNLOAD_SETTINGS uses bitrate 192 and video+audio', () => {
    expect(DEFAULT_DOWNLOAD_SETTINGS.mode).toBe('video+audio');
    expect(DEFAULT_DOWNLOAD_SETTINGS.quality).toBe('1080p');
    expect(DEFAULT_DOWNLOAD_SETTINGS.format).toBe('mp4');
    expect(DEFAULT_DOWNLOAD_SETTINGS.bitrate).toBe(192);
    expect(DEFAULT_DOWNLOAD_SETTINGS.captions).toEqual({ enabled: false, separateFile: false });
  });

  it('MOCK_PLAYLIST_ITEMS has 9 items in order with exact ids and urls', () => {
    expect(MOCK_PLAYLIST_ITEMS).toHaveLength(9);
    for (let i = 0; i < 9; i++) {
      const item = MOCK_PLAYLIST_ITEMS[i];
      expect(item.id).toBe(`p-${i + 1}`);
      expect(item.url).toBe(`https://youtube.com/watch?v=p-${i + 1}`);
      expect(item.channelName).toBe('Down4More Demo');
      expect(item.thumbnailUrl).toBeNull();
    }
  });

  it('playlist item sizes and durations match Flow spec section 6', () => {
    for (const expected of FLOW_SIZES) {
      const item = MOCK_PLAYLIST_ITEMS.find((i) => i.id === expected.id);
      expect(item).toBeTruthy();
      expect(item!.sizeBytes).toBe(expected.sizeBytes);
      expect(item!.durationSec).toBe(expected.durationSec);
    }
  });

  it('only p-4, p-8 and p-9 carry their own catalog', () => {
    const withCatalog = MOCK_PLAYLIST_ITEMS.filter((i) => i.catalog != null).map((i) => i.id);
    expect(withCatalog).toEqual(['p-4', 'p-8', 'p-9']);
    expect(MOCK_PLAYLIST_ITEMS[3].catalog?.qualities).toEqual(['1080p', '720p', '480p', '360p']);
    expect(MOCK_PLAYLIST_ITEMS[3].catalog?.bitrates).toEqual([96, 128, 160, 192]);
    expect(MOCK_PLAYLIST_ITEMS[7].catalog?.qualities).toEqual(['1080p', '720p', '480p', '360p']);
    expect(MOCK_PLAYLIST_ITEMS[8].catalog?.videoFormats).toEqual(['mp4', 'mkv']);
    expect(MOCK_PLAYLIST_ITEMS[8].catalog?.bitrates).toEqual([128, 192, 256]);
  });

  it('MOCK_MEDIA_ITEMS has at least 12 items: the 9 playlist items plus 3 more', () => {
    expect(MOCK_MEDIA_ITEMS.length).toBeGreaterThanOrEqual(12);
    const playlistIds = MOCK_PLAYLIST_ITEMS.map((i) => i.id);
    for (const id of playlistIds) {
      expect(MOCK_MEDIA_ITEMS.some((i) => i.id === id)).toBe(true);
    }
    const extraIds = ['m-10', 'm-11', 'm-12'];
    for (const id of extraIds) {
      expect(MOCK_MEDIA_ITEMS.some((i) => i.id === id)).toBe(true);
    }
  });

  it('the extra media items carry no catalog', () => {
    for (const id of ['m-10', 'm-11', 'm-12']) {
      const item = MOCK_MEDIA_ITEMS.find((i) => i.id === id);
      expect(item!.catalog).toBeUndefined();
    }
  });

  it('MOCK_DOWNLOADS has 7 table rows in order with priorities 1..7', () => {
    const table = MOCK_DOWNLOADS.slice(0, 7);
    expect(table.map((d) => d.id)).toEqual([
      'dl-1',
      'dl-2',
      'dl-3',
      'dl-4',
      'dl-5',
      'dl-6',
      'dl-7',
    ]);
    expect(table.map((d) => d.priority)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(table[0].status).toBe('downloading');
    expect(table[0].progress).toBe(67);
    expect(table[4].status).toBe('processing');
    expect(table[4].progress).toBe(100);
    expect(table[4].speedBps).toBeNull();
    expect(table[4].etaSec).toBeNull();
  });

  it('every download item has default settings', () => {
    for (const item of MOCK_DOWNLOADS) {
      expect(item.settings).toEqual(DEFAULT_DOWNLOAD_SETTINGS);
    }
  });

  it('MOCK_DOWNLOADS includes queued, paused, very long title and unknown total size items', () => {
    const ids = MOCK_DOWNLOADS.map((d) => d.id);
    expect(ids).toContain('dl-8'); // queued
    expect(ids).toContain('dl-9'); // paused
    expect(ids).toContain('dl-10'); // very long title
    expect(ids).toContain('dl-11'); // unknown total size

    const queued = MOCK_DOWNLOADS.find((d) => d.id === 'dl-8')!;
    expect(queued.status).toBe('queued');

    const paused = MOCK_DOWNLOADS.find((d) => d.id === 'dl-9')!;
    expect(paused.status).toBe('paused');
    expect(paused.speedBps).toBeNull();
    expect(paused.etaSec).toBeNull();

    const longTitle = MOCK_DOWNLOADS.find((d) => d.id === 'dl-10')!;
    expect(longTitle.title.length).toBeGreaterThan(100);

    const unknownTotal = MOCK_DOWNLOADS.find((d) => d.id === 'dl-11')!;
    expect(unknownTotal.totalBytes).toBeNull();
    expect(unknownTotal.etaSec).toBeNull();
  });

  it('MOCK_HISTORY has 70 entries (8 named + 62 generated)', () => {
    expect(MOCK_HISTORY).toHaveLength(70);
    const namedIds = ['h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-7', 'h-8'];
    for (const id of namedIds) {
      expect(MOCK_HISTORY.some((d) => d.id === id)).toBe(true);
    }
  });

  it('exactly one history entry is dated in the previous year', () => {
    const previousYear = new Date().getFullYear() - 1;
    let count = 0;
    for (const item of MOCK_HISTORY) {
      if (item.finishedAt && item.finishedAt.startsWith(`${previousYear}-`)) {
        count++;
      }
    }
    expect(count).toBe(1);
  });

  it('history entries are full DownloadItems with status done/failed and progress 100 for done', () => {
    for (const item of MOCK_HISTORY) {
      expect(item.status).toMatch(/^(done|failed)$/);
      expect(item.finishedAt).toBeTruthy();
      if (item.status === 'done') {
        expect(item.progress).toBe(100);
      }
    }
  });

  it('seedStore returns MOCK_DOWNLOADS followed by MOCK_HISTORY as one list', () => {
    const { items } = seedStore();
    expect(items.length).toBe(MOCK_DOWNLOADS.length + MOCK_HISTORY.length);
    expect(items.slice(0, MOCK_DOWNLOADS.length)).toEqual(MOCK_DOWNLOADS);
    expect(items.slice(MOCK_DOWNLOADS.length)).toEqual(MOCK_HISTORY);
  });

  it('seedStore dismissed ids leave exactly 4 done and 2 failed visible', () => {
    const { items, dismissedIds } = seedStore();
    const visible = items.filter((d) => !dismissedIds.includes(d.id));
    const done = visible.filter((d) => d.status === 'done');
    const failed = visible.filter((d) => d.status === 'failed');
    expect(done.length).toBe(4);
    expect(failed.length).toBe(2);
  });

  it('dismissedIds contains only history done/failed ids (not MOCK_DOWNLOADS ids)', () => {
    const { dismissedIds } = seedStore();
    const downloadIds = new Set(MOCK_DOWNLOADS.map((d) => d.id));
    for (const id of dismissedIds) {
      expect(id.startsWith('h-')).toBe(true);
      expect(downloadIds.has(id)).toBe(false);
    }
  });

  it('generatePlaylistItems produces deterministic items with fixed arithmetic pattern', () => {
    const items = generatePlaylistItems(5, 'Gen');
    expect(items).toHaveLength(5);
    expect(items[0].id).toBe('gen-1');
    expect(items[0].title).toBe('Gen 1');
    expect(items[0].durationSec).toBe(60);
    expect(items[0].sizeBytes).toBe(41943040);
    // Determinism: same args produce same result.
    expect(generatePlaylistItems(5, 'Gen')).toEqual(items);
    // No catalog on generated items.
    for (const item of items) {
      expect(item.catalog).toBeUndefined();
    }
  });
});
