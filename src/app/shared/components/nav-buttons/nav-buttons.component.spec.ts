import { TestBed } from '@angular/core/testing';
import { NavButtonsComponent } from './nav-buttons.component';
import {
  NavButton,
  navApply,
  navBack,
  navDownload,
  navFetch,
  navNext,
} from './nav-buttons.presets';

describe('NavButtonsComponent', () => {
  it('renders start and end buttons in array order and omits hidden ones', () => {
    const fixture = TestBed.createComponent(NavButtonsComponent);
    const buttons: NavButton[] = [
      navBack(),
      { id: 'hidden', label: 'Hidden', hidden: true },
      navNext(),
    ];
    fixture.componentRef.setInput('buttons', buttons);
    fixture.detectChanges();

    const rendered = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    expect(rendered.map((b) => b.textContent?.trim())).toEqual(['Back', 'Next']);
    expect(rendered[0].classList.contains('btn--ghost')).toBe(true);
    expect(rendered[1].classList.contains('btn--primary')).toBe(true);
  });

  it('emits pressed id only when enabled and not loading', () => {
    const fixture = TestBed.createComponent(NavButtonsComponent);
    const emitted: string[] = [];
    fixture.componentInstance.pressed.subscribe((id) => emitted.push(id));

    fixture.componentRef.setInput('buttons', [
      { id: 'ok', label: 'Go', variant: 'primary' },
      { id: 'off', label: 'Off', disabled: true },
      { id: 'spin', label: 'Wait', loading: true },
    ]);
    fixture.detectChanges();

    const btns = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    btns[0].click();
    btns[1].click();
    btns[2].click();

    expect(emitted).toEqual(['ok']);
    expect(btns[1].disabled).toBe(true);
    expect(btns[2].classList.contains('btn--loading')).toBe(true);
    expect(btns[2].getAttribute('aria-busy')).toBe('true');
  });

  it('sets aria-pressed only when defined and supports fullWidth modes', () => {
    const fixture = TestBed.createComponent(NavButtonsComponent);
    fixture.componentRef.setInput('buttons', [
      { id: 'pause', label: 'Pause all', variant: 'ghost', pressed: true, title: 'Resume all' },
      { id: 'plain', label: 'Plain' },
    ]);
    fixture.componentRef.setInput('fullWidth', 'compact');
    fixture.detectChanges();

    const btns = fixture.nativeElement.querySelectorAll('button');
    expect(btns[0].getAttribute('aria-pressed')).toBe('true');
    expect(btns[0].getAttribute('title')).toBe('Resume all');
    expect(btns[1].getAttribute('aria-pressed')).toBeNull();
    expect(fixture.nativeElement.querySelector('.nb--full-compact')).toBeTruthy();

    fixture.componentRef.setInput('fullWidth', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.nb--full')).toBeTruthy();
    expect(btns[0].classList.contains('btn--block')).toBe(true);
  });

  it('returns expected preset button configurations', () => {
    expect(navBack()).toEqual({
      id: 'back',
      label: 'Back',
      variant: 'ghost',
      side: 'start',
      icon: 'chevron-left',
    });
    expect(navNext().icon).toBe('chevron-right');
    expect(navFetch().id).toBe('fetch');
    expect(navDownload().variant).toBe('primary');
    expect(navApply().variant).toBe('apply');
  });
});
