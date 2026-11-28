import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { FetchInfoService } from './fetch-info.service';
import { NavigationService } from './navigation.service';

@Component({ template: '' })
class DummyComponent {}

describe('NavigationService', () => {
  let router: Router;
  let nav: NavigationService;
  let lastResult: ReturnType<typeof signal<unknown>>;

  beforeEach(async () => {
    lastResult = signal<unknown>(null);
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'single', component: DummyComponent },
          { path: 'downloads', component: DummyComponent },
          { path: 'history', component: DummyComponent },
        ]),
        {
          provide: FetchInfoService,
          useValue: { lastResult, clear: () => lastResult.set(null) },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    nav = TestBed.inject(NavigationService);
  });

  it('tracks flow routes only and navigates back without ping-ponging', async () => {
    lastResult.set({ kind: 'single', items: [], catalog: {}, failed: [] });
    await router.navigateByUrl('/');
    expect(nav.showBack()).toBe(false);

    await router.navigateByUrl('/single');
    expect(nav.showBack()).toBe(true);

    await router.navigateByUrl('/downloads'); // non-flow, skipped by history
    expect(nav.showBack()).toBe(true);

    // From a non-flow route, back() returns to the last flow step (/single)
    nav.back();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url).toBe('/single');

    // From /single, back() goes to the previous flow step (/)
    nav.back();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url).toBe('/');
  });

  it('returnToFlow returns to last flow route when fetch result exists, else "/"', async () => {
    lastResult.set({ kind: 'single', items: [], catalog: {}, failed: [] });
    await router.navigateByUrl('/single');
    await router.navigateByUrl('/history');

    nav.returnToFlow();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url).toBe('/single');

    lastResult.set(null);
    await router.navigateByUrl('/history');
    nav.returnToFlow();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url).toBe('/');
  });

  it('resetFlow flushes history and fetch state so back() returns to "/"', async () => {
    lastResult.set({ kind: 'single', items: [], catalog: {}, failed: [] });
    await router.navigateByUrl('/');
    await router.navigateByUrl('/single');
    await router.navigateByUrl('/downloads');

    nav.resetFlow();
    expect(lastResult()).toBeNull();
    expect(nav.flowVersion()).toBe(1);

    nav.back();
    await new Promise((r) => setTimeout(r, 0));
    expect(router.url).toBe('/');
  });
});
