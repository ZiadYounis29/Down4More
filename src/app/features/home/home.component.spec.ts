import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MOCK_CATALOG, MOCK_MEDIA_ITEMS, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { FetchResult } from '@core/models';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fetchSpy: { load: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    fetchSpy = { load: vi.fn() };
    routerSpy = { navigate: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: FetchInfoService, useValue: fetchSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('adds valid links, rejects invalid and duplicate links keeping skipped text', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[aria-label="Link"]') as HTMLInputElement;
    const plus = fixture.nativeElement.querySelector('button[aria-label="Add link"]') as HTMLButtonElement;

    input.value = 'youtube.com/watch?v=1 not_a_link youtube.com/watch?v=1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    plus.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('ul.list li.row');
    expect(rows).toHaveLength(1);
    expect(input.value).toContain('not_a_link');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      "That doesn't look like a link.",
    );
  });

  it('navigates to /single for single video and /playlist/select for playlist', () => {
    const singleRes: FetchResult = {
      kind: 'single',
      items: [MOCK_MEDIA_ITEMS[0]],
      catalog: MOCK_CATALOG,
      failed: [],
    };
    fetchSpy.load.mockReturnValue(of(singleRes));

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[aria-label="Link"]') as HTMLInputElement;
    input.value = 'https://youtube.com/watch?v=abc';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const fetchBtn = fixture.nativeElement.querySelector('d4m-nav-buttons button') as HTMLButtonElement;
    fetchBtn.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/single']);

    const playlistRes: FetchResult = {
      kind: 'playlist',
      items: MOCK_PLAYLIST_ITEMS,
      catalog: MOCK_CATALOG,
      failed: [],
    };
    fetchSpy.load.mockReturnValue(of(playlistRes));
    input.value = 'https://youtube.com/playlist?list=PL1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fetchBtn.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/playlist', 'select']);
  });

  it('marks rows failed and stays on Home when all links fail, or shows error on failure', () => {
    fetchSpy.load.mockReturnValue(
      of({
        kind: 'playlist',
        items: [],
        catalog: MOCK_CATALOG,
        failed: [{ url: 'https://example.com/fail', reason: 'failed' }],
      }),
    );

    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[aria-label="Link"]') as HTMLInputElement;
    input.value = 'https://example.com/fail';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const fetchBtn = fixture.nativeElement.querySelector('d4m-nav-buttons button') as HTMLButtonElement;
    fetchBtn.click();
    fixture.detectChanges();

    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain("Couldn't load");
    expect(fixture.nativeElement.textContent).toContain(
      'None of the links could be loaded. Check them and try again.',
    );

    fetchSpy.load.mockReturnValue(throwError(() => new Error('down')));
    fetchBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Couldn't reach the downloader. Try again.");
  });
});
