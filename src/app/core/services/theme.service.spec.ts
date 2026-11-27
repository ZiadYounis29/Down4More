import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  it('toggles theme and updates document dataset attribute', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    const initial = service.theme();
    expect(document.documentElement.dataset['theme']).toBe(initial);

    service.toggle();
    TestBed.flushEffects();

    const next = initial === 'dark' ? 'light' : 'dark';
    expect(service.theme()).toBe(next);
    expect(document.documentElement.dataset['theme']).toBe(next);
  });

  it('restores saved dark theme on a new instance', () => {
    localStorage.setItem('d4m-theme', 'dark');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('does not throw when localStorage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    TestBed.configureTestingModule({});
    expect(() => {
      const service = TestBed.inject(ThemeService);
      TestBed.flushEffects();
      service.toggle();
      TestBed.flushEffects();
    }).not.toThrow();
  });
});
