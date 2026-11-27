import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FetchResult } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { SingleComponent } from './single.component';

const MOCK_RESULT: FetchResult = {
  kind: 'single',
  catalog: {
    qualities: ['2160p', '1080p', '720p'],
    videoFormats: ['mp4', 'mkv'],
    audioFormats: ['mp3', 'm4a'],
    bitrates: [128, 192, 320],
  },
  items: [
    {
      id: 'v1',
      url: 'https://example.com/watch?v=1',
      title: 'My Video: Test?',
      durationSec: 120,
      thumbnailUrl: null,
      sizeBytes: 41_943_040,
      channelName: 'Test Channel',
    },
  ],
  failed: [],
};

describe('SingleComponent', () => {
  let downloadSpy: { start: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    downloadSpy = { start: vi.fn().mockReturnValue(of(void 0)) };
    routerSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SingleComponent],
      providers: [
        { provide: FetchInfoService, useValue: { lastResult: signal(MOCK_RESULT) } },
        { provide: DownloadService, useValue: downloadSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('renders .single grid with real components and toggles fs-on / trim-on classes', () => {
    const fixture = TestBed.createComponent(SingleComponent);
    fixture.detectChanges();

    const grid = fixture.nativeElement.querySelector('.single') as HTMLElement;
    expect(grid.classList.contains('fs-on')).toBe(false);
    expect(grid.classList.contains('trim-on')).toBe(false);
    expect(fixture.nativeElement.querySelector('d4m-page-container')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('d4m-download-options')).toBeTruthy();

    const fsBtn = fixture.nativeElement.querySelector('.a-framesize [role="switch"]') as HTMLButtonElement;
    fsBtn.click();
    fixture.detectChanges();
    expect(grid.classList.contains('fs-on')).toBe(true);

    const trimBtn = fixture.nativeElement.querySelector('.a-trim [role="switch"]') as HTMLButtonElement;
    trimBtn.click();
    fixture.detectChanges();
    expect(grid.classList.contains('trim-on')).toBe(true);
  });

  it('updates live estimated size and sends request of 1 on download', () => {
    const fixture = TestBed.createComponent(SingleComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.a-info')?.textContent).toContain('40 MB');

    const qualitySel = fixture.nativeElement.querySelector('d4m-quality select') as HTMLSelectElement;
    qualitySel.value = '2'; // 720p
    qualitySel.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.a-info')?.textContent).toContain('23 MB');

    const dlBtn = fixture.nativeElement.querySelector('.a-download button') as HTMLButtonElement;
    dlBtn.click();

    expect(downloadSpy.start).toHaveBeenCalledTimes(1);
    const reqs = downloadSpy.start.mock.calls[0][0];
    expect(reqs).toHaveLength(1);
    expect(reqs[0].extras.fileName).toBe('My Video Test.mp4');
    expect(reqs[0].extras.trim).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/downloads']);
  });

  it('shows error message when DownloadService.start fails', () => {
    downloadSpy.start.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(SingleComponent);
    fixture.detectChanges();

    const dlBtn = fixture.nativeElement.querySelector('.a-download button') as HTMLButtonElement;
    dlBtn.click();
    fixture.detectChanges();

    const err = fixture.nativeElement.querySelector('.single__error') as HTMLElement;
    expect(err.textContent).toContain("Couldn't start the download. Try again.");
  });
});
