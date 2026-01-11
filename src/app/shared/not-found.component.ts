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
      <p>The resource you requested is not part of the academy workspace.</p>
      <a routerLink="/">Return to dashboard</a>
    </section>
  `,
})
export class NotFoundComponent {}
