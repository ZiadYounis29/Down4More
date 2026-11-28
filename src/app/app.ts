import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@core/layout/nav-bar';
import { NavigationService } from '@core/services/navigation.service';
import { NavButtonsComponent, navBack } from '@shared/components/nav-buttons';

@Component({
  imports: [RouterOutlet, NavBarComponent, NavButtonsComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly nav = inject(NavigationService);
  protected readonly backButtons = [navBack()];
}
