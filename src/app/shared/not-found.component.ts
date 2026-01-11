import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="not-found">
      <h1>Page not found</h1>
      <p>The workspace route you requested does not exist in this to-do studio.</p>
      <a routerLink="/">Return to overview</a>
    </section>
  `,
})
export class NotFoundComponent {}
