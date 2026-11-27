import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MOCK_CATALOG, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { FetchResult } from '@core/models';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { PlaylistStateService } from '../services/playlist-state.service';
import { PlaylistSelectComponent } from './playlist-select.component';

describe('PlaylistSelectComponent', () => {
  let lastResult: WritableSignal<FetchResult | null>;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    lastResult = signal<FetchResult | null>({
      kind: 'playlist',
      items: MOCK_PLAYLIST_ITEMS,
      catalog: MOCK_CATALOG,
      failed: [],
    });
    routerSpy = { navigate: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [PlaylistSelectComponent],
      providers: [
        { provide: FetchInfoService, useValue: { lastResult } },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  it('starts with all rows ticked and disables Next when 0 ticked', () => {
    const state = TestBed.inject(PlaylistStateService);
    const fixture = TestBed.createComponent(PlaylistSelectComponent);
    fixture.detectChanges();

    expect(state.chosenIds()).toHaveLength(9);
    const nextBtn = fixture.nativeElement.querySelector('d4m-nav-buttons button') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);

    nextBtn.click();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/playlist', 'options']);

    state.chosenIds.set([]);
    fixture.detectChanges();
    expect(nextBtn.disabled).toBe(true);
  });

  it('shows failed notice only when failedCount > 0', () => {
    const fixture = TestBed.createComponent(PlaylistSelectComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sel__notice')).toBeNull();

    lastResult.set({
      kind: 'playlist',
      items: MOCK_PLAYLIST_ITEMS,
      catalog: MOCK_CATALOG,
      failed: [{ url: 'https://example.com/fail', reason: 'fail' }],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sel__notice')?.textContent).toContain(
      "1 link couldn't be loaded.",
    );
  });
});
