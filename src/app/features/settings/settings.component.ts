import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageContainerComponent } from '@shared/components/page-container';

@Component({
  selector: 'd4m-settings',
  standalone: true,
  imports: [PageContainerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <d4m-page-container size="md">
      <h1>Settings</h1>
      <p class="muted">Settings will be added in a later version.</p>
    </d4m-page-container>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 800;
      }
      .muted {
        margin: 0;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class SettingsComponent {}
