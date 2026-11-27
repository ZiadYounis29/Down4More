import { Routes } from '@angular/router';
import { DEMO_ENTRIES } from './demos/demo-registry';

export const DEV_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dev-shell.component').then((m) => m.DevShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: DEMO_ENTRIES[0].id },
      ...DEMO_ENTRIES.map((e) => ({ path: e.id, loadComponent: e.load })),
    ],
  },
];
