import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then(
        (module) => module.DashboardComponent,
      ),
  },
  {
    path: 'academy',
    loadChildren: () =>
      import('../features/academy/academy.module').then((module) => module.AcademyModule),
  },
  {
    path: 'labs',
    loadChildren: () =>
      import('../features/labs/labs.module').then((module) => module.LabsModule),
  },
  {
    path: '**',
    loadComponent: () =>
      import('../shared/not-found.component').then((module) => module.NotFoundComponent),
  },
];
