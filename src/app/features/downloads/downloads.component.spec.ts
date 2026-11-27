import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MOCK_DOWNLOADS } from '@core/mocks/mock-data';
import { DownloadItem } from '@core/models';
import { DownloadService } from '@core/services/download.service';
import { ProgressService } from '@core/services/progress.service';
import { DownloadsComponent } from './downloads.component';

describe('DownloadsComponent', () => {
  let items: ReturnType<typeof signal<DownloadItem[]>>;
  let controlSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    items = signal<DownloadItem[]>(MOCK_DOWNLOADS);
    controlSpy = vi.fn().mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [DownloadsComponent],
      providers: [
        provideRouter([]),
        { provide: ProgressService, useValue: { items } },
        { provide: DownloadService, useValue: { control: controlSpy } },
      ],
    }).compileComponents();
  });

  it('displays counts, queue, and defaults details panel to first in-progress item', () => {
    const fixture = TestBed.createComponent(DownloadsComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('4 Done');
    expect(text).toContain('11 Downloading');
    expect(text).toContain('2 Failed');
    expect(text).toContain(MOCK_DOWNLOADS[0].title);
  });

  it('filters by status pill and fires toolbar Pause all and Priority actions', () => {
    const fixture = TestBed.createComponent(DownloadsComponent);
    fixture.detectChanges();

    const pills = fixture.nativeElement.querySelectorAll('d4m-status-count button.pill');
    (pills[2] as HTMLButtonElement).click(); // Failed
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('0 of 2 selected');

    (pills[2] as HTMLButtonElement).click(); // Back to queue
    fixture.detectChanges();

    const pauseAllBtn = Array.from(
      fixture.nativeElement.querySelectorAll('d4m-nav-buttons button'),
    ).find((b) => (b as HTMLElement).textContent?.includes('Pause all')) as HTMLButtonElement;
    pauseAllBtn.click();
    expect(controlSpy).toHaveBeenCalledWith('pause', expect.any(Array));

    // Select all visible items via header button and trigger Priority
    const selectAllBtn = fixture.nativeElement.querySelector('.header button') as HTMLButtonElement;
    selectAllBtn.click();
    fixture.detectChanges();

    const priorityBtn = Array.from(
      fixture.nativeElement.querySelectorAll('d4m-nav-buttons button'),
    ).find((b) => (b as HTMLElement).textContent?.includes('Priority')) as HTMLButtonElement;
    priorityBtn.click();
    expect(controlSpy).toHaveBeenCalledWith(
      'prioritize',
      expect.arrayContaining([MOCK_DOWNLOADS[0].id]),
    );
  });

  it('shows error alert when control fails', () => {
    controlSpy.mockReturnValue(throwError(() => new Error('err')));
    const fixture = TestBed.createComponent(DownloadsComponent);
    fixture.detectChanges();

    const pauseAllBtn = Array.from(
      fixture.nativeElement.querySelectorAll('d4m-nav-buttons button'),
    ).find((b) => (b as HTMLElement).textContent?.includes('Pause all')) as HTMLButtonElement;
    pauseAllBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dl__error')?.textContent).toContain(
      "Couldn't do that. Try again.",
    );
  });
});
