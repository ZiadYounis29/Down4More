import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PanelComponent } from './panel.component';

@Component({
  imports: [PanelComponent],
  template: `<d4m-panel [label]="label()" [padding]="padding()"><p>Body</p></d4m-panel>`,
})
class TestHostComponent {
  readonly label = signal<string | undefined>(undefined);
  readonly padding = signal<'default' | 'roomy'>('default');
}

describe('PanelComponent', () => {
  it('projects content and optionally renders label', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p')?.textContent).toBe('Body');
    expect(fixture.nativeElement.querySelector('.lab')).toBeNull();

    fixture.componentInstance.label.set('Quality');
    fixture.componentInstance.padding.set('roomy');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.lab')?.textContent).toBe('Quality');
    expect(fixture.nativeElement.querySelector('.panel--roomy')).toBeTruthy();
  });
});
