import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  NavButton,
  NavButtonsComponent,
  navApply,
  navBack,
  navDownload,
  navFetch,
  navNext,
} from '@shared/components/nav-buttons';

@Component({
  selector: 'd4m-nav-buttons-demo',
  imports: [NavButtonsComponent],
  template: `
    <h2>Nav buttons</h2>
    <p style="color: var(--color-text-muted); font-weight: 700;">
      Last emitted id: {{ lastId() }}
    </p>

    <section class="demo__case">
      <p class="demo__caption">Size sm — all variants &amp; pressed state</p>
      <d4m-nav-buttons size="sm" [buttons]="smButtons" (pressed)="lastId.set($event)" />
    </section>

    <section class="demo__case">
      <p class="demo__caption">Size md — start &amp; end presets together (Back + Next + Fetch)</p>
      <d4m-nav-buttons size="md" [buttons]="mdButtons" (pressed)="lastId.set($event)" />
    </section>

    <section class="demo__case">
      <p class="demo__caption">Size lg — Apply &amp; Download</p>
      <d4m-nav-buttons size="lg" [buttons]="lgButtons" (pressed)="lastId.set($event)" />
    </section>

    <section class="demo__case">
      <p class="demo__caption">Disabled, loading, and hidden</p>
      <d4m-nav-buttons size="md" [buttons]="stateButtons" (pressed)="lastId.set($event)" />
    </section>

    <section class="demo__case">
      <p class="demo__caption">fullWidth = true</p>
      <d4m-nav-buttons
        size="lg"
        [fullWidth]="true"
        [buttons]="[downloadPreset]"
        (pressed)="lastId.set($event)"
      />
    </section>

    <section class="demo__case">
      <p class="demo__caption">fullWidth = "compact" (390px wrapper)</p>
      <div class="demo__compact-wrap">
        <d4m-nav-buttons
          size="md"
          fullWidth="compact"
          [buttons]="[nextPreset]"
          (pressed)="lastId.set($event)"
        />
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavButtonsDemoComponent {
  protected readonly lastId = signal('none');
  protected readonly downloadPreset = navDownload();
  protected readonly nextPreset = navNext();

  protected readonly smButtons: NavButton[] = [
    { id: 'sm-primary', label: 'Primary', variant: 'primary', side: 'start' },
    { id: 'sm-secondary', label: 'Secondary', variant: 'secondary', side: 'start' },
    { id: 'sm-ghost', label: 'Pause all', variant: 'ghost', pressed: true, title: 'Resume all' },
    { id: 'sm-danger', label: 'Remove', variant: 'danger', icon: 'trash' },
    { id: 'sm-apply', label: 'Apply', variant: 'apply', icon: 'check' },
  ];

  protected readonly mdButtons: NavButton[] = [navBack(), navNext(), navFetch()];

  protected readonly lgButtons: NavButton[] = [navApply(), navDownload()];

  protected readonly stateButtons: NavButton[] = [
    { id: 'disabled', label: 'Disabled', variant: 'primary', disabled: true },
    { id: 'loading', label: 'Loading', variant: 'primary', loading: true },
    { id: 'hidden', label: 'Hidden', variant: 'secondary', hidden: true },
    { id: 'active', label: 'Clickable', variant: 'secondary' },
  ];
}
