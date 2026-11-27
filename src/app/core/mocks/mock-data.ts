import {
  DownloadItem,
  DownloadOptionsCatalog,
  DownloadSettings,
  DownloadStatus,
  MediaItem,
  MediaMode,
} from '@core/models';

const MB = 1024 * 1024;

export const DEFAULT_DOWNLOAD_SETTINGS: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

export const MOCK_CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus', 'wav'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

const playlistUrl = (id: string): string => `https://youtube.com/watch?v=${id}`;

const makeMediaItem = (
  id: string,
  title: string,
  sizeBytes: number | null,
  durationSec: number | null,
  catalog?: DownloadOptionsCatalog,
): MediaItem => ({
  id,
  url: playlistUrl(id),
  title,
  thumbnailUrl: null,
  durationSec,
  channelName: 'Down4More Demo',
  sizeBytes,
  ...(catalog ? { catalog } : {}),
});

const VERY_LONG_TITLE =
  'Morning run routine - A comprehensive guided morning run for beginners covering warm-up, interval training, cardio, breathing, cool-down stretches, and post-run recovery to maximize daily energy';

export const MOCK_PLAYLIST_ITEMS: MediaItem[] = [
  makeMediaItem('p-1', 'Rocket landing, full broadcast', 41943040, 768),
  makeMediaItem('p-2', 'How tides actually work', 29360128, 495),
  makeMediaItem('p-3', 'Street food tour: Alexandria', 117440512, 1443),
  makeMediaItem('p-4', 'Lo-fi study mix, 2 hours', 100663296, 7200, {
    ...MOCK_CATALOG,
    qualities: ['1080p', '720p', '480p', '360p'],
    bitrates: [96, 128, 160, 192],
  }),
  makeMediaItem('p-5', 'Desert timelapse in 4K', 67108864, 207),
  makeMediaItem('p-6', 'Interview: building a boat', 76546048, 2472),
  makeMediaItem('p-7', VERY_LONG_TITLE, 19922944, 350),
  makeMediaItem('p-8', 'Keyboard sound test', null, 129, {
    ...MOCK_CATALOG,
    qualities: ['1080p', '720p', '480p', '360p'],
  }),
  makeMediaItem('p-9', 'Documentary: the Nile delta', 213909504, null, {
    ...MOCK_CATALOG,
    videoFormats: ['mp4', 'mkv'],
    bitrates: [128, 192, 256],
  }),
];

export const MOCK_MEDIA_ITEMS: MediaItem[] = [
  ...MOCK_PLAYLIST_ITEMS,
  makeMediaItem('m-10', 'Sourdough bread in 60 minutes', 52428800, 3600),
  makeMediaItem('m-11', 'Live stream: tech conference day 2', null, null),
  makeMediaItem('m-12', VERY_LONG_TITLE, 73400320, 2700),
];

const makeDownloadItem = (
  id: string,
  title: string,
  status: DownloadStatus,
  progress: number,
  downloadedBytes: number,
  totalBytes: number | null,
  speedBps: number | null,
  etaSec: number | null,
  priority: number,
  sizeBytes: number | null,
  error?: string,
): DownloadItem => ({
  id,
  url: playlistUrl(id),
  title,
  thumbnailUrl: null,
  durationSec: null,
  channelName: 'Down4More Demo',
  sizeBytes,
  status,
  progress,
  downloadedBytes,
  totalBytes,
  speedBps,
  etaSec,
  settings: { ...DEFAULT_DOWNLOAD_SETTINGS },
  priority,
  ...(error ? { error } : {}),
});

const DOWNLOAD_SETTINGS: DownloadSettings = { ...DEFAULT_DOWNLOAD_SETTINGS };

export const MOCK_DOWNLOADS: DownloadItem[] = [
  // Row 1: Rocket landing, full broadcast - downloading 67% 17.2 MB/s 412/615 MB 40 hrs
  makeDownloadItem(
    'dl-1',
    'Rocket landing, full broadcast',
    'downloading',
    67,
    432013312,
    644874240,
    18035507,
    144000,
    1,
    41943040,
  ),
  // Row 2: How tides actually work - downloading 42% 9.8 MB/s 118/280 MB 12 min
  makeDownloadItem(
    'dl-2',
    'How tides actually work',
    'downloading',
    42,
    123731968,
    293601280,
    10276045,
    720,
    2,
    29360128,
  ),
  // Row 3: Street food tour: Alexandria - downloading 18% 4.1 MB/s 203/1120 MB 3 hrs
  makeDownloadItem(
    'dl-3',
    'Street food tour: Alexandria',
    'downloading',
    18,
    212860928,
    1174405120,
    4299162,
    10800,
    3,
    117440512,
  ),
  // Row 4: Lo-fi study mix, 2 hours - downloading 91% 21.5 MB/s 874/960 MB 6 sec
  makeDownloadItem(
    'dl-4',
    'Lo-fi study mix, 2 hours',
    'downloading',
    91,
    916455424,
    1006632960,
    22544384,
    6,
    4,
    100663296,
  ),
  // Row 5: Desert timelapse in 4K - processing 100% no speed/eta 640/640 MB
  makeDownloadItem(
    'dl-5',
    'Desert timelapse in 4K',
    'processing',
    100,
    671088640,
    671088640,
    null,
    null,
    5,
    67108864,
  ),
  // Row 6: Interview: building a boat - downloading 34% 6.3 MB/s 88/260 MB 28 min
  makeDownloadItem(
    'dl-6',
    'Interview: building a boat',
    'downloading',
    34,
    92274688,
    272629760,
    6606029,
    1680,
    6,
    76546048,
  ),
  // Row 7: Keyboard sound test - downloading 8% 2.2 MB/s 12/150 MB 1 hr
  makeDownloadItem(
    'dl-7',
    'Keyboard sound test',
    'downloading',
    8,
    12582912,
    157286400,
    2306867,
    3600,
    7,
    null,
  ),
  // One queued item
  makeDownloadItem('dl-8', 'Queued sample item', 'queued', 0, 0, null, null, null, 8, null),
  // One paused item (speedBps and etaSec null)
  makeDownloadItem(
    'dl-9',
    'Paused sample item',
    'paused',
    45,
    45000000,
    100000000,
    null,
    null,
    9,
    52428800,
  ),
  // One item with a very long title
  makeDownloadItem(
    'dl-10',
    VERY_LONG_TITLE,
    'downloading',
    55,
    55000000,
    100000000,
    5000000,
    9000,
    10,
    100000000,
  ),
  // One item with unknown total size (totalBytes null, etaSec null)
  makeDownloadItem(
    'dl-11',
    'Unknown total size item',
    'downloading',
    30,
    30000000,
    null,
    4000000,
    null,
    11,
    null,
  ),
  // Four done items
  makeDownloadItem(
    'dl-12',
    'Done item one',
    'done',
    100,
    50000000,
    50000000,
    null,
    null,
    12,
    50000000,
  ),
  makeDownloadItem(
    'dl-13',
    'Done item two',
    'done',
    100,
    80000000,
    80000000,
    null,
    null,
    13,
    80000000,
  ),
  makeDownloadItem(
    'dl-14',
    'Done item three',
    'done',
    100,
    30000000,
    30000000,
    null,
    null,
    14,
    30000000,
  ),
  makeDownloadItem(
    'dl-15',
    'Done item four',
    'done',
    100,
    120000000,
    120000000,
    null,
    null,
    15,
    120000000,
  ),
  // Two failed items
  makeDownloadItem(
    'dl-16',
    'Failed item one',
    'failed',
    0,
    0,
    40000000,
    null,
    null,
    16,
    40000000,
    'Video unavailable',
  ),
  makeDownloadItem(
    'dl-17',
    'Failed item two',
    'failed',
    0,
    0,
    60000000,
    null,
    null,
    17,
    60000000,
    'Network error',
  ),
];

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

const historyErrors: string[] = ['Video unavailable', 'Network error'];

const qualities: string[] = ['1080p', '720p', '480p'];
const formats: string[] = ['mp4', 'mkv', 'webm'];
const modes: MediaMode[] = ['video+audio', 'video+audio', 'audio-only'];

function historySettings(index: number): DownloadSettings {
  const mode = modes[index % modes.length];
  return {
    mode,
    quality: mode === 'audio-only' ? null : qualities[index % qualities.length],
    format: formats[index % formats.length],
    bitrate: mode === 'video-only' ? null : 192,
    captions: { enabled: false, separateFile: false },
  };
}

function isoRelative(msOffset: number): string {
  return new Date(now - msOffset).toISOString();
}

export const MOCK_HISTORY: DownloadItem[] = [
  // Row 1: Rocket landing, full broadcast - done, 20 min ago
  {
    ...makeDownloadItem(
      'h-1',
      'Rocket landing, full broadcast',
      'done',
      100,
      644874240,
      644874240,
      null,
      null,
      100,
      644874240,
    ),
    finishedAt: isoRelative(20 * minute),
    settings: historySettings(0),
  },
  // Row 2: How tides actually work - failed, 90 min ago
  {
    ...makeDownloadItem(
      'h-2',
      'How tides actually work',
      'failed',
      0,
      0,
      293601280,
      null,
      null,
      101,
      29360128,
    ),
    finishedAt: isoRelative(90 * minute),
    error: 'Video unavailable',
    settings: historySettings(1),
  },
  // Row 3: Street food tour: Alexandria - done, yesterday 18:10
  {
    ...makeDownloadItem(
      'h-3',
      'Street food tour: Alexandria',
      'done',
      100,
      1174405120,
      1174405120,
      null,
      null,
      102,
      117440512,
    ),
    finishedAt: isoRelative(day + 10 * hour + 10 * minute),
    settings: historySettings(2),
  },
  // Row 4: Lo-fi study mix, 2 hours - failed, yesterday 09:40 (audio-only)
  {
    ...makeDownloadItem(
      'h-4',
      'Lo-fi study mix, 2 hours',
      'failed',
      0,
      0,
      100663296,
      null,
      null,
      103,
      100663296,
    ),
    finishedAt: isoRelative(day + 9 * hour + 40 * minute),
    error: 'Network error',
    settings: historySettings(3),
  },
  // Row 5: Desert timelapse in 4K - done, 4 days ago
  {
    ...makeDownloadItem(
      'h-5',
      'Desert timelapse in 4K',
      'done',
      100,
      671088640,
      671088640,
      null,
      null,
      104,
      67108864,
    ),
    finishedAt: isoRelative(4 * day),
    settings: historySettings(4),
  },
  // Row 6: Interview: building a boat - failed, 4 days ago
  {
    ...makeDownloadItem(
      'h-6',
      'Interview: building a boat',
      'failed',
      0,
      0,
      272629760,
      null,
      null,
      105,
      76546048,
    ),
    finishedAt: isoRelative(4 * day),
    error: 'Video unavailable',
    settings: historySettings(5),
  },
  // Row 7: Keyboard sound test - done, 5 days ago
  {
    ...makeDownloadItem(
      'h-7',
      'Keyboard sound test',
      'done',
      100,
      157286400,
      157286400,
      null,
      null,
      106,
      null,
    ),
    finishedAt: isoRelative(5 * day),
    settings: historySettings(6),
  },
  // Row 8: Documentary: the Nile delta - done, 6 days ago
  {
    ...makeDownloadItem(
      'h-8',
      'Documentary: the Nile delta',
      'done',
      100,
      2139095040,
      2139095040,
      null,
      null,
      107,
      213909504,
    ),
    finishedAt: isoRelative(6 * day),
    settings: historySettings(7),
  },
  // 62 generated older entries: alternating done/failed, spread over ~120 days,
  // one dated in the previous year (31 Dec 2025), one very long title,
  // one with unknown size, failed entries alternate error text.
  ...Array.from({ length: 62 }).map((_, i) => {
    const index = i + 8;
    const status: DownloadStatus = i % 2 === 0 ? 'done' : 'failed';
    const error = status === 'failed' ? historyErrors[i % historyErrors.length] : undefined;
    const title = i === 15 ? VERY_LONG_TITLE : `Generated history item ${index}`;
    const sizeBytes = i === 30 ? null : i % 7 === 0 ? null : 41943040 * ((i % 9) + 1);
    const totalBytes = sizeBytes;
    // One entry dated in the previous year (31 Dec 2025).
    let finishedAt: string;
    if (i === 31) {
      finishedAt = new Date(2025, 11, 31, 12, 0, 0).toISOString();
    } else {
      const daysAgo = 7 + (i / 62) * 120;
      finishedAt = isoRelative(Math.floor(daysAgo) * day);
    }
    return {
      ...makeDownloadItem(
        `h-${index}`,
        title,
        status,
        100,
        totalBytes ?? 0,
        totalBytes,
        null,
        null,
        108 + i,
        sizeBytes,
        error,
      ),
      finishedAt,
      settings: historySettings(index),
    } as DownloadItem & { finishedAt: string };
  }),
];

export function seedStore(): {
  items: DownloadItem[];
  dismissedIds: string[];
} {
  const items = [...MOCK_DOWNLOADS, ...MOCK_HISTORY];

  // Dismiss every history done/failed entry so it stays out of the Downloads
  // view. History keeps all 70 entries because history() is not dismiss-filtered.
  // Downloads therefore shows exactly MOCK_DOWNLOADS's 4 done and 2 failed.
  const dismissedIds = MOCK_HISTORY.filter((d) => d.status === 'done' || d.status === 'failed').map(
    (d) => d.id,
  );

  return { items, dismissedIds };
}

export function generatePlaylistItems(
  count: number,
  prefix: string = 'Generated video',
): MediaItem[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `gen-${i + 1}`;
    const durationSec = 60 * ((i % 60) + 1);
    const sizeBytes = 41943040 * ((i % 9) + 1);
    return makeMediaItem(id, `${prefix} ${i + 1}`, sizeBytes, durationSec);
  });
}
