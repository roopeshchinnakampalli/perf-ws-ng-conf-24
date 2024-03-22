import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppShellComponent } from './app-shell/app-shell.component';
import { DirtyChecksComponent } from './dirty-checks/dirty-checks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent, DirtyChecksComponent],
  template: `
    <app-shell>
      <dirty-checks />
      <router-outlet />
    </app-shell>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {}
