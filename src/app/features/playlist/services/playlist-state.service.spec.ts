import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MOCK_CATALOG, MOCK_PLAYLIST_ITEMS } from '@core/mocks/mock-data';
import { FetchResult } from '@core/models';
import { FetchInfoService } from '@core/services/fetch-info.service';
import { hasChosenGuard } from '../guards/has-chosen.guard';
import { hasFetchResultGuard } from '../guards/has-fetch-result.guard';
import { isSingleKindGuard } from '../../single/guards/is-single-kind.guard';
import { PlaylistStateService } from './playlist-state.service';

const makeResult = (overrides: Partial<FetchResult> = {}): FetchResult => ({
  kind: 'playlist',
  items: MOCK_PLAYLIST_ITEMS,
  catalog: MOCK_CATALOG,
  failed: [],
  ...overrides,
});

describe('PlaylistStateService and route guards', () => {
  let lastResult: WritableSignal<FetchResult | null>;
  let state: PlaylistStateService;

  beforeEach(() => {
    lastResult = signal<FetchResult | null>(makeResult());
    TestBed.configureTestingModule({
      providers: [{ provide: FetchInfoService, useValue: { lastResult } }],
    });
    state = TestBed.inject(PlaylistStateService);
  });

  it('selects all chosenIds initially and resets on a new lastResult', () => {
    expect(state.chosenIds()).toHaveLength(9);
    state.chosenIds.set(['p-1', 'p-2']);
    expect(state.chosenItems().map((i) => i.id)).toEqual(['p-1', 'p-2']);

    lastResult.set(makeResult({ items: MOCK_PLAYLIST_ITEMS.slice(0, 3) }));
    expect(state.chosenIds()).toEqual(['p-1', 'p-2', 'p-3']);
  });

  it('handles Global mode vs ticked rows, dirty tracking, apply, and requests fallback', () => {
    expect(state.isGlobal()).toBe(true);
    expect(state.targetItems()).toHaveLength(9);
    expect(state.dirty()).toBe(false);

    state.selectedIds.set(['p-1', 'p-2']);
    expect(state.isGlobal()).toBe(false);
    expect(state.targetItems().map((i) => i.id)).toEqual(['p-1', 'p-2']);

    state.draft.update((d) => ({ ...d, quality: '720p' }));
    expect(state.dirty()).toBe(true);

    state.apply();
    expect(state.dirty()).toBe(false);
    expect(state.tagFor('p-1')).toBe('720p · mp4');
    expect(state.tagFor('p-3')).toBeNull();

    state.selectedIds.set([]);
    const reqs = state.requests();
    expect(reqs.find((r) => r.item.id === 'p-1')!.settings.quality).toBe('720p');
    expect(reqs.find((r) => r.item.id === 'p-3')!.settings.quality).toBe('1080p');
  });

  it('computes sizeFor (original, scaled on apply, null) and summary text', () => {
    // p-1 is 40 MB = 41943040; p-8 has sizeBytes null
    expect(state.sizeFor('p-1')).toBe(41943040);
    expect(state.sizeFor('p-8')).toBeNull();

    state.selectedIds.set(['p-1']);
    state.draft.update((d) => ({ ...d, quality: '720p' }));
    state.apply();

    // 41943040 * (0.92 * 0.55 + 0.08) = 24578621
    expect(state.sizeFor('p-1')).toBeCloseTo(24_578_621, -2);
    expect(state.summary()).toContain('1 of 9 selected');

    state.selectedIds.set(['p-8']);
    expect(state.summary()).toBe('1 of 9 selected');

    state.chosenIds.set(['p-1']);
    expect(state.summary()).toContain('Global · 1 video');
  });

  it('switches effectiveCatalog between single item catalog and main catalog', () => {
    // p-4 has its own narrower catalog (no 2160p/1440p)
    state.selectedIds.set(['p-4']);
    expect(state.effectiveCatalog().qualities).toEqual(['1080p', '720p', '480p', '360p']);

    // Two rows -> main catalog
    state.selectedIds.set(['p-4', 'p-5']);
    expect(state.effectiveCatalog().qualities).toContain('2160p');

    // Global with several -> main catalog
    state.selectedIds.set([]);
    expect(state.effectiveCatalog().qualities).toContain('2160p');
  });

  it('enforces route guards cleanly', () => {
    const router = TestBed.inject(Router);
    const urlOf = (res: unknown) =>
      res instanceof UrlTree ? router.serializeUrl(res) : res;

    expect(urlOf(TestBed.runInInjectionContext(() => hasFetchResultGuard({} as never, {} as never)))).toBe(true);
    expect(urlOf(TestBed.runInInjectionContext(() => hasChosenGuard({} as never, {} as never)))).toBe(true);
    expect(urlOf(TestBed.runInInjectionContext(() => isSingleKindGuard({} as never, {} as never)))).toBe('/');

    state.chosenIds.set([]);
    expect(urlOf(TestBed.runInInjectionContext(() => hasChosenGuard({} as never, {} as never)))).toBe('/playlist/select');

    lastResult.set(makeResult({ kind: 'single', items: [MOCK_PLAYLIST_ITEMS[0]] }));
    expect(urlOf(TestBed.runInInjectionContext(() => isSingleKindGuard({} as never, {} as never)))).toBe(true);

    lastResult.set(null);
    expect(urlOf(TestBed.runInInjectionContext(() => hasFetchResultGuard({} as never, {} as never)))).toBe('/');
    expect(urlOf(TestBed.runInInjectionContext(() => hasChosenGuard({} as never, {} as never)))).toBe('/');
  });
});
