import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavigationService } from '@core/services/navigation.service';
import { App } from './app';

const mockNav = { back: vi.fn(), returnToFlow: vi.fn(), showBack: signal(false) };

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: NavigationService, useValue: mockNav },
      ],
    }).compileComponents();
  });

  it('should create the app with nav-bar and router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(el.querySelector('d4m-nav-bar')).toBeTruthy();
    expect(el.querySelector('main.shell__main router-outlet')).toBeTruthy();
  });
});
