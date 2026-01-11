import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LabsShellComponent } from './labs-shell.component';
import { LabCatalogComponent } from './components/lab-catalog.component';
import { IncidentDrillsComponent } from './components/incident-drills.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LabsShellComponent,
        children: [
          {
            path: 'catalog',
            component: LabCatalogComponent,
          },
          {
            path: 'incidents',
            component: IncidentDrillsComponent,
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'catalog',
          },
        ],
      },
    ]),
  ],
  declarations: [LabsShellComponent, LabCatalogComponent, IncidentDrillsComponent],
})
export class LabsModule {}
