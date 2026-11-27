import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { ThemeService } from '@core/services/theme.service';
import { NavBarComponent } from './nav-bar.component';

@Component({ standalone: true, template: '<d4m-nav-bar />', imports: [NavBarComponent] })
class HostComponent {}

describe('NavBarComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideRouter([
          { path: '', component: HostComponent },
          { path: 'downloads', component: HostComponent },
          { path: 'history', component: HostComponent },
          { path: 'settings', component: HostComponent },
        ]),
      ],
    }).compileComponents();
  });

  it('renders 3 links with none active on / and one active on /history', async () => {
    const harness = await RouterTestingHarness.create('/');
    const links = Array.from(
      harness.routeNativeElement!.querySelectorAll('a.nl'),
    ) as HTMLAnchorElement[];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Downloads', 'History', 'Settings']);
    expect(links.some((a) => a.classList.contains('on'))).toBe(false);

    await harness.navigateByUrl('/history');
    harness.detectChanges();
    const active = Array.from(harness.routeNativeElement!.querySelectorAll('a.nl.on'));
    expect(active.length).toBe(1);
    expect(active[0].textContent?.trim()).toBe('History');
  });

  it('toggles theme and updates aria-label', async () => {
    const harness = await RouterTestingHarness.create('/');
    const theme = TestBed.inject(ThemeService);
    const btn = harness.routeNativeElement!.querySelector('button.btn--icon') as HTMLButtonElement;
    const before = theme.theme();
    expect(btn.getAttribute('aria-label')).toBe(
      before === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    );

    btn.click();
    harness.detectChanges();

    const after = before === 'dark' ? 'light' : 'dark';
    expect(theme.theme()).toBe(after);
    expect(btn.getAttribute('aria-label')).toBe(
      after === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    );
  });
});
