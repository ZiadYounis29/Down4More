import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { HistoryService } from '@core/services/history.service';
import { MockApiService } from '@core/services/mock-api.service';
import { ProgressService } from '@core/services/progress.service';
import { APP_ROUTES } from './app.routes';
import { PlaylistStateService } from './features/playlist/services/playlist-state.service';

async function waitForNav(router: Router, trigger: () => Promise<void> | void): Promise<void> {
  const nav = firstValueFrom(router.events.pipe(filter((e) => e instanceof NavigationEnd)));
  await trigger();
  await nav;
}

describe('App end-to-end routes and flows', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(APP_ROUTES),
        { provide: ApiService, useClass: MockApiService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects guarded routes when no fetch result exists and redirects unknown routes to /', async () => {
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create('/single');
    expect(router.url).toBe('/');

    await harness.navigateByUrl('/playlist/select');
    expect(router.url).toBe('/');

    await harness.navigateByUrl('/playlist/options');
    expect(router.url).toBe('/');

    await harness.navigateByUrl('/nope-unknown-route');
    expect(router.url).toBe('/');
  });

  it('runs single video happy path: / -> /single -> /downloads', async () => {
    const router = TestBed.inject(Router);
    const progress = TestBed.inject(ProgressService);
    const harness = await RouterTestingHarness.create('/');

    const input = harness.routeNativeElement!.querySelector(
      'input[aria-label="Link"]',
    ) as HTMLInputElement;
    input.value = 'https://youtube.com/watch?v=abc123';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const fetchBtn = harness.routeNativeElement!.querySelector(
      'd4m-nav-buttons button',
    ) as HTMLButtonElement;
    await waitForNav(router, async () => {
      fetchBtn.click();
      await vi.advanceTimersByTimeAsync(650);
    });
    harness.detectChanges();

    expect(router.url).toBe('/single');

    const dlBtn = harness.routeNativeElement!.querySelector(
      '.a-download button',
    ) as HTMLButtonElement;
    await waitForNav(router, async () => {
      dlBtn.click();
      await vi.advanceTimersByTimeAsync(300);
    });
    harness.detectChanges();

    expect(router.url).toBe('/downloads');
    expect(progress.items().some((i) => i.id.startsWith('dl-req-'))).toBe(true);
  });

  it('runs playlist happy path with per-video options and backend fallback', async () => {
    const router = TestBed.inject(Router);
    const state = TestBed.inject(PlaylistStateService);
    const progress = TestBed.inject(ProgressService);
    const harness = await RouterTestingHarness.create('/');

    const input = harness.routeNativeElement!.querySelector(
      'input[aria-label="Link"]',
    ) as HTMLInputElement;
    input.value = 'https://youtube.com/playlist?list=PL1';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const fetchBtn = harness.routeNativeElement!.querySelector(
      'd4m-nav-buttons button',
    ) as HTMLButtonElement;
    await waitForNav(router, async () => {
      fetchBtn.click();
      await vi.advanceTimersByTimeAsync(650);
    });
    harness.detectChanges();

    expect(router.url).toBe('/playlist/select');
    expect(state.items()).toHaveLength(9);

    const nextBtn = harness.routeNativeElement!.querySelector(
      'd4m-nav-buttons .nb__group--end button',
    ) as HTMLButtonElement;
    await waitForNav(router, () => {
      nextBtn.click();
    });
    harness.detectChanges();

    expect(router.url).toBe('/playlist/options');

    // Select p-4 alone -> narrow catalog (no 2160p)
    state.selectedIds.set(['p-4']);
    harness.detectChanges();
    const narrowOpts = Array.from(
      harness.routeNativeElement!.querySelectorAll('d4m-quality select option'),
    ).map((o) => (o as HTMLOptionElement).textContent?.trim());
    expect(narrowOpts).not.toContain('2160p');

    // Select p-4 and p-5 -> full catalog; pick 2160p, Apply, Download
    state.selectedIds.set(['p-4', 'p-5']);
    harness.detectChanges();
    const qualitySel = harness.routeNativeElement!.querySelector(
      'd4m-quality select',
    ) as HTMLSelectElement;
    qualitySel.value = '0'; // 2160p
    qualitySel.dispatchEvent(new Event('change'));
    harness.detectChanges();

    const applyBtn = harness.routeNativeElement!.querySelector(
      '.opt__apply button',
    ) as HTMLButtonElement;
    applyBtn.click();
    harness.detectChanges();

    const dlBtn = harness.routeNativeElement!.querySelector(
      '.opt__download button',
    ) as HTMLButtonElement;
    await waitForNav(router, async () => {
      dlBtn.click();
      await vi.advanceTimersByTimeAsync(300);
    });
    harness.detectChanges();

    expect(router.url).toBe('/downloads');
    const created = progress.items().filter((i) => i.id.startsWith('dl-req-'));
    const p4Item = created.find((i) => i.title === 'Lo-fi study mix, 2 hours')!;
    const p5Item = created.find((i) => i.title === 'Desert timelapse in 4K')!;
    expect(p5Item.settings.quality).toBe('2160p');
    expect(p4Item.settings.quality).toBe('1080p'); // backend fallback to nearest lower
  });

  it('loads 70+ entries on /history and 4 Done / 2 Failed on /downloads', async () => {
    const historyService = TestBed.inject(HistoryService);
    const harness = await RouterTestingHarness.create('/downloads');
    await vi.advanceTimersByTimeAsync(300);
    harness.detectChanges();

    expect(harness.routeNativeElement!.textContent).toContain('4 Done');
    expect(harness.routeNativeElement!.textContent).toContain('2 Failed');

    await harness.navigateByUrl('/history');
    harness.detectChanges();
    expect(historyService.items().length).toBeGreaterThanOrEqual(70);
  });

  it('fetches 300 items when URL contains "big"', async () => {
    const router = TestBed.inject(Router);
    const state = TestBed.inject(PlaylistStateService);
    const harness = await RouterTestingHarness.create('/');

    const input = harness.routeNativeElement!.querySelector(
      'input[aria-label="Link"]',
    ) as HTMLInputElement;
    input.value = 'https://youtube.com/playlist?list=big';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const fetchBtn = harness.routeNativeElement!.querySelector(
      'd4m-nav-buttons button',
    ) as HTMLButtonElement;
    await waitForNav(router, async () => {
      fetchBtn.click();
      await vi.advanceTimersByTimeAsync(650);
    });
    harness.detectChanges();

    expect(router.url).toBe('/playlist/select');
    expect(state.items()).toHaveLength(300);
  });
});
