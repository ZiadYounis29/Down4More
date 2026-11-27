export type UrlKind = 'video' | 'playlist' | 'unknown';

export type ParsedUrl =
  | { valid: false; reason: 'empty' | 'not-a-link' }
  | { valid: true; url: string; key: string; kind: UrlKind };

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
]);

const TRACKING_PARAMS = new Set(['si', 'feature', 'pp']);
const OTHER_PLAYLIST_SEGMENTS = ['/playlist', '/playlists/', '/sets/', '/album/', '/showcase/'];

function addDefaultScheme(raw: string): string {
  // Keep explicit schemes (http://, ftp://, mailto:, etc.), unless it looks like host:port without scheme.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    return raw;
  }
  if (/^(mailto|javascript|data|tel|file|ftp):/i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

function stripTrackingParams(params: URLSearchParams): void {
  for (const key of [...params.keys()]) {
    if (TRACKING_PARAMS.has(key) || key.startsWith('utm_')) {
      params.delete(key);
    }
  }
}

function classifyUrl(u: URL): UrlKind {
  const host = u.hostname;
  const path = u.pathname;
  const hasV = Boolean(u.searchParams.get('v'));
  const hasList = Boolean(u.searchParams.get('list'));

  if (YOUTUBE_HOSTS.has(host)) {
    if (path.startsWith('/playlist')) return 'playlist';
    if (path === '/watch' && hasV) return 'video';
    if (hasList && !hasV) return 'playlist';
    if (
      path.startsWith('/shorts/') ||
      path.startsWith('/live/') ||
      path.startsWith('/embed/')
    ) {
      return 'video';
    }
    if (
      path.startsWith('/@') ||
      path.startsWith('/channel/') ||
      path.startsWith('/c/') ||
      path.startsWith('/user/')
    ) {
      return 'playlist';
    }
    return 'unknown';
  }

  if (host === 'youtu.be') {
    return /^\/[^/]+/.test(path) ? 'video' : 'unknown';
  }

  const lowerPath = path.toLowerCase();
  if (hasList || OTHER_PLAYLIST_SEGMENTS.some((seg) => lowerPath.includes(seg))) {
    return 'playlist';
  }

  return 'unknown';
}

export function parseUrl(raw: string): ParsedUrl {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, reason: 'empty' };
  }

  let parsed: URL;
  try {
    parsed = new URL(addDefaultScheme(trimmed));
  } catch {
    return { valid: false, reason: 'not-a-link' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: 'not-a-link' };
  }

  const host = parsed.hostname;
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.')) {
    return { valid: false, reason: 'not-a-link' };
  }

  parsed.hash = '';
  stripTrackingParams(parsed.searchParams);
  if (parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }

  let normalized = parsed.toString();
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return {
    valid: true,
    url: normalized,
    key: normalized,
    kind: classifyUrl(parsed),
  };
}
