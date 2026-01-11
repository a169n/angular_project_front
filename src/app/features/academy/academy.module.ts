import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AcademyShellComponent } from './academy-shell.component';
import { AcademyTrackComponent } from './components/academy-track.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AcademyShellComponent,
        children: [
          {
            path: 'tracks',
            component: AcademyTrackComponent,
          },
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'tracks',
          },
        ],
      },
    ]),
  ],
  declarations: [AcademyShellComponent, AcademyTrackComponent],
})
export class AcademyModule {}
