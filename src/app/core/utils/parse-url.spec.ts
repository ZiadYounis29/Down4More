import { parseUrl } from './parse-url';

describe('parseUrl', () => {
  it('rejects empty string and whitespace-only input as empty', () => {
    expect(parseUrl('')).toEqual({ valid: false, reason: 'empty' });
    expect(parseUrl('   \t\n  ')).toEqual({ valid: false, reason: 'empty' });
  });

  it('rejects invalid URLs, non-http/https schemes, and hosts without a dot', () => {
    expect(parseUrl('not a url')).toEqual({ valid: false, reason: 'not-a-link' });
    expect(parseUrl('ftp://example.com/file')).toEqual({ valid: false, reason: 'not-a-link' });
    expect(parseUrl('http://localhost/watch?v=1')).toEqual({ valid: false, reason: 'not-a-link' });
    expect(parseUrl('localhost')).toEqual({ valid: false, reason: 'not-a-link' });
  });

  it('adds https:// when no scheme is provided', () => {
    const res = parseUrl('youtube.com/watch?v=abc123');
    expect(res).toEqual({
      valid: true,
      url: 'https://youtube.com/watch?v=abc123',
      key: 'https://youtube.com/watch?v=abc123',
      kind: 'video',
    });
  });

  it('normalises host casing, drops fragment and trailing slash, and strips tracking params', () => {
    const res = parseUrl(
      'https://WWW.YouTube.com/watch/?v=abc&si=track1&feature=share&pp=yg&utm_source=x&utm_medium=y#t=30',
    );
    expect(res).toEqual({
      valid: true,
      url: 'https://www.youtube.com/watch?v=abc',
      key: 'https://www.youtube.com/watch?v=abc',
      kind: 'video',
    });
  });

  it('produces identical keys for equivalent links', () => {
    const a = parseUrl('https://YouTube.com/watch?v=xyz&si=123#top');
    const b = parseUrl('youtube.com/watch/?v=xyz&utm_campaign=abc');
    expect(a.valid && b.valid).toBe(true);
    if (a.valid && b.valid) {
      expect(a.key).toBe(b.key);
    }
  });

  it('classifies every row of the YouTube kind table', () => {
    expect(parseUrl('https://youtube.com/playlist?list=PL1')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://m.youtube.com/playlist?list=PL2')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://music.youtube.com/playlist?list=PL3')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://www.youtube.com/watch?v=abc')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    // watch URL with both v= and list= is a video
    expect(parseUrl('https://www.youtube.com/watch?v=abc&list=PL1')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    // list= without v=
    expect(parseUrl('https://youtube.com/browse?list=PL1')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://youtube.com/shorts/abc123')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    expect(parseUrl('https://youtube.com/live/live123')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    expect(parseUrl('https://youtube.com/embed/emb123')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    expect(parseUrl('https://youtube.com/@creator')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://youtube.com/channel/UC123')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://youtube.com/c/ChannelName')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://youtube.com/user/UserName')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
  });

  it('classifies youtu.be links with or without list= as video', () => {
    expect(parseUrl('https://youtu.be/dQw4w9WgXcQ')).toMatchObject({
      valid: true,
      kind: 'video',
    });
    expect(parseUrl('https://youtu.be/dQw4w9WgXcQ?list=PL1')).toMatchObject({
      valid: true,
      kind: 'video',
    });
  });

  it('classifies other hosts by playlist markers or unknown', () => {
    expect(parseUrl('https://example.com/playlist/42')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://example.com/playlists/42')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://soundcloud.com/artist/sets/mix')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://bandcamp.com/album/demo')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://vimeo.com/showcase/999')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://example.com/media?list=88')).toMatchObject({
      valid: true,
      kind: 'playlist',
    });
    expect(parseUrl('https://vimeo.com/123456')).toMatchObject({
      valid: true,
      kind: 'unknown',
    });
  });
});
