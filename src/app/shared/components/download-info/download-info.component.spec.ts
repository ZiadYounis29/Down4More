import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadInfoComponent } from './download-info.component';
import { DownloadItem } from '@core/models';

function makeItem(overrides: Partial<DownloadItem> = {}): DownloadItem {
  return {
    id: 'd-1',
    url: 'https://www.youtube.com/watch?v=abc',
    title: 'Test Download',
    thumbnailUrl: null,
    durationSec: 768,
    channelName: 'Test Channel',
    sizeBytes: 41_943_040,
    status: 'downloading',
    progress: 45,
    downloadedBytes: 18_874_368,
    totalBytes: 41_943_040,
    speedBps: 1_048_576,
    etaSec: 22,
    settings: {
      mode: 'video+audio',
      quality: '1080p',
      format: 'mp4',
      bitrate: 192,
      captions: { enabled: false, separateFile: false },
    },
    priority: 1,
    finishedAt: undefined,
    ...overrides,
  } as DownloadItem;
}

describe('DownloadInfoComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadInfoComponent],
    }).compileComponents();
  });

  function create(variant: 'small' | 'big' | 'history', item: DownloadItem) {
    const fixture = TestBed.createComponent(DownloadInfoComponent);
    fixture.componentRef.setInput('variant', variant);
    fixture.componentRef.setInput('item', item);
    fixture.detectChanges();
    return fixture;
  }

  // ── Status x variant rendering ──────────────────────────────────────────────

  it('small/downloading renders progress and speed', () => {
    const f = create('small', makeItem({ status: 'downloading' }));
    const el = f.nativeElement as HTMLElement;
    expect(el.querySelector('.di-small')).not.toBeNull();
    expect(el.textContent).toContain('45%');
  });

  it('small/queued shows Queued text', () => {
    const f = create('small', makeItem({ status: 'queued' }));
    expect(f.nativeElement.textContent).toContain('Queued');
  });

  it('small/paused shows no pause button, shows resume and cancel', () => {
    const f = create('small', makeItem({ status: 'paused' }));
    const btns = f.nativeElement.querySelectorAll('.di-small__actions button') as NodeListOf<HTMLElement>;
    const labels = Array.from(btns).map(b => b.getAttribute('aria-label'));
    expect(labels.some(l => l?.startsWith('Resume'))).toBe(true);
    expect(labels.some(l => l?.startsWith('Cancel'))).toBe(true);
    expect(labels.some(l => l?.startsWith('Pause'))).toBe(false);
  });

  it('small/processing shows no buttons', () => {
    const f = create('small', makeItem({ status: 'processing' }));
    const btns = f.nativeElement.querySelectorAll('.di-small__actions button');
    expect(btns.length).toBe(0);
  });

  it('small/done shows dismiss button', () => {
    const f = create('small', makeItem({ status: 'done', finishedAt: new Date().toISOString() }));
    const labels = Array.from(f.nativeElement.querySelectorAll('.di-small__actions button') as NodeListOf<HTMLElement>)
      .map(b => b.getAttribute('aria-label'));
    expect(labels.some(l => l === 'Dismiss')).toBe(true);
  });

  it('small/failed shows retry and dismiss', () => {
    const f = create('small', makeItem({ status: 'failed', error: 'Network error' }));
    const labels = Array.from(f.nativeElement.querySelectorAll('.di-small__actions button') as NodeListOf<HTMLElement>)
      .map(b => b.getAttribute('aria-label'));
    expect(labels.some(l => l?.startsWith('Retry'))).toBe(true);
    expect(labels.some(l => l === 'Dismiss')).toBe(true);
  });

  it('big variant renders details panel', () => {
    const f = create('big', makeItem());
    expect(f.nativeElement.querySelector('.di-big')).not.toBeNull();
    expect(f.nativeElement.textContent).toContain('1080p');
    expect(f.nativeElement.textContent).toContain('mp4');
  });

  it('big/processing shows no pause/cancel buttons', () => {
    const f = create('big', makeItem({ status: 'processing' }));
    const btns = f.nativeElement.querySelectorAll('.di-big__actions button') as NodeListOf<HTMLElement>;
    expect(btns.length).toBe(0);
  });

  // ── History variant ─────────────────────────────────────────────────────────

  it('history/done shows "Succeeded" chip', () => {
    const f = create('history', makeItem({ status: 'done', finishedAt: new Date().toISOString() }));
    expect(f.nativeElement.textContent).toContain('Succeeded');
  });

  it('history/failed shows "Failed" chip with error text', () => {
    const f = create('history', makeItem({ status: 'failed', error: 'Video unavailable', finishedAt: new Date().toISOString() }));
    const text = f.nativeElement.textContent as string;
    expect(text).toContain('Failed');
  });

  it('history/failed shows retry and remove buttons', () => {
    const f = create('history', makeItem({ status: 'failed', finishedAt: new Date().toISOString() }));
    const btns = f.nativeElement.querySelectorAll('.di-history__actions button') as NodeListOf<HTMLElement>;
    const labels = Array.from(btns).map(b => b.getAttribute('aria-label'));
    expect(labels.some(l => l?.startsWith('Retry'))).toBe(true);
    expect(labels.some(l => l?.includes('from history'))).toBe(true);
  });

  it('history/done shows only remove button', () => {
    const f = create('history', makeItem({ status: 'done', finishedAt: new Date().toISOString() }));
    const btns = f.nativeElement.querySelectorAll('.di-history__actions button') as NodeListOf<HTMLElement>;
    expect(btns.length).toBe(1);
    expect(btns[0].getAttribute('aria-label')).toContain('from history');
  });

  // ── Event emission ──────────────────────────────────────────────────────────

  it('pause button emits { type: "pause", id }', () => {
    const f = create('small', makeItem({ status: 'downloading' }));
    let evt: { type: string; id: string } | undefined;
    f.componentInstance.action.subscribe(e => (evt = e));
    const btn = Array.from(f.nativeElement.querySelectorAll('.di-small__actions button') as NodeListOf<HTMLElement>)
      .find(b => b.getAttribute('aria-label')?.startsWith('Pause'));
    btn?.click();
    expect(evt).toEqual({ type: 'pause', id: 'd-1' });
  });

  it('remove button emits { type: "remove", id }', () => {
    const f = create('history', makeItem({ status: 'done', finishedAt: new Date().toISOString() }));
    let evt: { type: string; id: string } | undefined;
    f.componentInstance.action.subscribe(e => (evt = e));
    const btn = Array.from(f.nativeElement.querySelectorAll('.di-history__actions button') as NodeListOf<HTMLElement>)
      .find(b => b.getAttribute('aria-label')?.includes('from history'));
    btn?.click();
    expect(evt).toEqual({ type: 'remove', id: 'd-1' });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────

  it('progress clamped at 100', () => {
    const f = create('small', makeItem({ status: 'downloading', progress: 150 }));
    const component = f.componentInstance;
    expect(component['clampedProgress']()).toBe(100);
  });

  it('clicking anywhere on selectable small row toggles selected without firing on action button click', () => {
    const f = TestBed.createComponent(DownloadInfoComponent);
    f.componentRef.setInput('variant', 'small');
    f.componentRef.setInput('item', makeItem({ status: 'downloading' }));
    f.componentRef.setInput('selectable', true);
    f.detectChanges();

    const row = f.nativeElement.querySelector('.di-small') as HTMLElement;
    row.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe(true);
    expect(row.classList.contains('di-small--selected')).toBe(true);

    // Clicking Pause should not toggle selection
    const pauseBtn = f.nativeElement.querySelector('.di-small__actions button') as HTMLButtonElement;
    pauseBtn.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe(true);
  });

  it('audio-only mode shows "Audio" for quality in history', () => {
    const f = create('history', makeItem({
      status: 'done',
      finishedAt: new Date().toISOString(),
      settings: { mode: 'audio-only', quality: null, format: 'mp3', bitrate: 192, captions: { enabled: false, separateFile: false } },
    }));
    expect(f.nativeElement.textContent).toContain('Audio');
  });
});
