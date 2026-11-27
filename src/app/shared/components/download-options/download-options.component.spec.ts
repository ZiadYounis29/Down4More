import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadOptionsComponent } from './download-options.component';
import type { DownloadOptionsCatalog, DownloadSettings } from '@core/models';

const MOCK_CATALOG: DownloadOptionsCatalog = {
  qualities: ['2160p', '1440p', '1080p', '720p', '480p', '360p'],
  videoFormats: ['mp4', 'mkv', 'webm'],
  audioFormats: ['mp3', 'm4a', 'opus'],
  bitrates: [96, 128, 160, 192, 256, 320],
};

const DEFAULT_SETTINGS: DownloadSettings = {
  mode: 'video+audio',
  quality: '1080p',
  format: 'mp4',
  bitrate: 192,
  captions: { enabled: false, separateFile: false },
};

describe('DownloadOptionsComponent', () => {
  let fixture: ComponentFixture<DownloadOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadOptionsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(DownloadOptionsComponent);
    fixture.componentRef.setInput('settings', { ...DEFAULT_SETTINGS });
    fixture.componentRef.setInput('catalog', MOCK_CATALOG);
  });

  it('renders all 5 panels by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('d4m-panel').length).toBe(5);
  });

  it('hiddenFields removes the bitrate panel', () => {
    fixture.componentRef.setInput('hiddenFields', ['bitrate']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('d4m-panel').length).toBe(4);
    expect(fixture.nativeElement.querySelector('d4m-bitrate')).toBeNull();
  });

  it('audio-only mode nulls quality, sets audioFormats, disables bitrate control is not', () => {
    // Switching to audio-only via settings
    fixture.componentRef.setInput('settings', {
      ...DEFAULT_SETTINGS,
      mode: 'audio-only',
      quality: null,
    });
    fixture.detectChanges();
    // quality select should be disabled
    const qualitySel = fixture.nativeElement.querySelector(
      'd4m-quality select',
    ) as HTMLSelectElement;
    expect(qualitySel.disabled).toBe(true);
    // format select should contain audio formats
    const formatSel = fixture.nativeElement.querySelector('d4m-format select') as HTMLSelectElement;
    expect(formatSel.options[0].text).toBe('mp3');
  });

  it('video-only mode nulls bitrate', () => {
    fixture.componentRef.setInput('settings', {
      ...DEFAULT_SETTINGS,
      mode: 'video-only',
      bitrate: null,
    });
    fixture.detectChanges();
    const bitrateSel = fixture.nativeElement.querySelector(
      'd4m-bitrate select',
    ) as HTMLSelectElement;
    expect(bitrateSel.disabled).toBe(true);
  });

  it('bitrate options come from catalog.bitrates', () => {
    fixture.detectChanges();
    const bitrateSel = fixture.nativeElement.querySelector(
      'd4m-bitrate select',
    ) as HTMLSelectElement;
    expect(bitrateSel.options.length).toBe(6);
    expect(bitrateSel.options[0].text).toBe('96 kbps');
    expect(bitrateSel.options[5].text).toBe('320 kbps');
  });

  it('contents layout adds area-* classes in DOM order: captions, mode, quality, format, bitrate', () => {
    fixture.componentRef.setInput('layout', 'contents');
    fixture.detectChanges();
    const panels = Array.from(fixture.nativeElement.querySelectorAll('d4m-panel')) as HTMLElement[];
    // The spec DOM order: captions, mode, quality, format, bitrate
    expect(panels[0].classList.contains('area-captions')).toBe(true);
    expect(panels[1].classList.contains('area-mode')).toBe(true);
    expect(panels[2].classList.contains('area-quality')).toBe(true);
    expect(panels[3].classList.contains('area-format')).toBe(true);
    expect(panels[4].classList.contains('area-bitrate')).toBe(true);
  });

  it('switching mode in UI does not produce invalid combination', () => {
    fixture.detectChanges();
    // Switch to audio-only by updating the model
    const comp = fixture.componentInstance;
    comp['onMode']('audio-only');
    fixture.detectChanges();
    const s = comp.settings();
    expect(s.mode).toBe('audio-only');
    expect(s.quality).toBeNull();
    // format is an audio format
    expect(MOCK_CATALOG.audioFormats).toContain(s.format);
  });

  it('switching to video-only nulls bitrate', () => {
    const comp = fixture.componentInstance;
    comp['onMode']('video-only');
    fixture.detectChanges();
    expect(comp.settings().bitrate).toBeNull();
    expect(comp.settings().quality).not.toBeNull();
  });

  it('switching back to video+audio restores a valid bitrate from catalog', () => {
    const comp = fixture.componentInstance;
    comp['onMode']('video-only');
    fixture.detectChanges();
    comp['onMode']('video+audio');
    fixture.detectChanges();
    const s = comp.settings();
    expect(s.bitrate).not.toBeNull();
    expect(MOCK_CATALOG.bitrates).toContain(s.bitrate!);
  });

  it('narrow per-video catalog clamps quality and bitrates', () => {
    const narrowCatalog: DownloadOptionsCatalog = {
      ...MOCK_CATALOG,
      qualities: ['1080p', '720p', '480p', '360p'],
      bitrates: [96, 128, 160, 192],
    };
    // Start with settings that would be out of range for narrow catalog
    fixture.componentRef.setInput('settings', {
      ...DEFAULT_SETTINGS,
      quality: '2160p',
      bitrate: 320,
    });
    fixture.componentRef.setInput('catalog', narrowCatalog);
    fixture.detectChanges();
    const s = fixture.componentInstance.settings();
    expect(narrowCatalog.qualities).toContain(s.quality!);
    expect(narrowCatalog.bitrates).toContain(s.bitrate!);
  });
});
