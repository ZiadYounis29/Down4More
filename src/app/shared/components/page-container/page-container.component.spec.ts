import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  PageContainerComponent,
  PageContainerPadding,
  PageContainerSize,
} from './page-container.component';

@Component({
  imports: [PageContainerComponent],
  template: `
    <d4m-page-container [size]="size()" [padding]="padding()">
      @if (showHeader()) {
        <h1 header>Header</h1>
      }
      <p class="stack-content">Stack</p>
      @if (showFooter()) {
        <div footer>Footer</div>
      }
    </d4m-page-container>
  `,
})
class StackHostComponent {
  readonly size = signal<PageContainerSize>('md');
  readonly padding = signal<PageContainerPadding>('default');
  readonly showHeader = signal(false);
  readonly showFooter = signal(false);
}

@Component({
  imports: [PageContainerComponent],
  template: `
    <d4m-page-container size="lg" padding="split" layout="split">
      <div main class="main-content">Main</div>
      <div side class="side-content">Side</div>
    </d4m-page-container>
  `,
})
class SplitHostComponent {}

describe('PageContainerComponent', () => {
  it('applies size classes sm, md, lg', () => {
    const fixture = TestBed.createComponent(StackHostComponent);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.card') as HTMLElement;
    expect(card.classList.contains('card--md')).toBe(true);

    fixture.componentInstance.size.set('sm');
    fixture.detectChanges();
    expect(card.classList.contains('card--sm')).toBe(true);

    fixture.componentInstance.size.set('lg');
    fixture.detectChanges();
    expect(card.classList.contains('card--lg')).toBe(true);
  });

  it('keeps header and footer wrappers empty when nothing is projected', () => {
    const fixture = TestBed.createComponent(StackHostComponent);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.card__header') as HTMLElement;
    const footer = fixture.nativeElement.querySelector('.card__footer') as HTMLElement;
    expect(header.children.length).toBe(0);
    expect(footer.children.length).toBe(0);

    fixture.componentInstance.showHeader.set(true);
    fixture.componentInstance.showFooter.set(true);
    fixture.detectChanges();
    expect(header.textContent?.trim()).toBe('Header');
    expect(footer.textContent?.trim()).toBe('Footer');
  });

  it('projects [main] and [side] in split layout', () => {
    const fixture = TestBed.createComponent(SplitHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.card__split')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.card__main .main-content')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.card__side .side-content')).toBeTruthy();
  });
});
