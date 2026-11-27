import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MOCK_CATALOG, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { FetchResult } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { PlaylistStateService } from '../services/playlist-state.service';
import { PlaylistOptionsComponent } from './playlist-options.component';

describe('PlaylistOptionsComponent', () => {
  let downloadSpy: { start: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let lastResult: ReturnType<typeof signal<FetchResult | null>>;

  beforeEach(async () => {
    lastResult = signal<FetchResult | null>({
      kind: 'playlist',
      items: MOCK_PLAYLIST_ITEMS,
      catalog: MOCK_CATALOG,
      failed: [],
    });
    downloadSpy = { start: vi.fn().mockReturnValue(of(undefined)) };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PlaylistOptionsComponent],
      providers: [
        { provide: FetchInfoService, useValue: { lastResult } },
        { provide: DownloadService, useValue: downloadSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('opens in Global with Download (9), updates effectiveCatalog, and stamps applied tags', () => {
    const state = TestBed.inject(PlaylistStateService);
    const fixture = TestBed.createComponent(PlaylistOptionsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Download (9)');
    expect(fixture.nativeElement.textContent).toContain('Settings applied');

    state.selectedIds.set(['p-4']);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Download (1)');
    const qualityOpts = Array.from(
      fixture.nativeElement.querySelectorAll('d4m-quality select option'),
    ).map((o) => (o as HTMLOptionElement).textContent?.trim());
    expect(qualityOpts).not.toContain('2160p');

    state.selectedIds.set(['p-4', 'p-5']);
    fixture.detectChanges();
    const fullQualityOpts = Array.from(
      fixture.nativeElement.querySelectorAll('d4m-quality select option'),
    ).map((o) => (o as HTMLOptionElement).textContent?.trim());
    expect(fullQualityOpts).toContain('2160p');

    state.draft.update((d) => ({ ...d, mode: 'audio-only', quality: null, format: 'mp3', bitrate: 192 }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unsaved changes');

    // Download blocked while dirty
    const dlBtn = fixture.nativeElement.querySelector('.opt__download button') as HTMLButtonElement;
    dlBtn.click();
    fixture.detectChanges();
    expect(downloadSpy.start).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.opt__message')?.textContent).toContain(
      'Press Apply to save your changes first.',
    );

    // Apply then Download
    const applyBtn = fixture.nativeElement.querySelector('.opt__apply button') as HTMLButtonElement;
    applyBtn.click();
    fixture.detectChanges();
    expect(state.tagFor('p-4')).toBe('mp3 · 192k');
    expect(state.tagFor('p-5')).toBe('mp3 · 192k');

    dlBtn.click();
    expect(downloadSpy.start).toHaveBeenCalledTimes(1);
    expect(downloadSpy.start.mock.calls[0][0]).toHaveLength(2);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/downloads']);
  });

  it('keeps page intact and shows message when startDownloads fails', () => {
    downloadSpy.start.mockReturnValue(throwError(() => new Error('down')));
    const fixture = TestBed.createComponent(PlaylistOptionsComponent);
    fixture.detectChanges();

    const dlBtn = fixture.nativeElement.querySelector('.opt__download button') as HTMLButtonElement;
    dlBtn.click();
    fixture.detectChanges();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.opt__message')?.textContent).toContain(
      "Couldn't start the downloads. Try again.",
    );
  });
});
