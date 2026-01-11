import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-academy-shell',
  template: `
    <section class="academy">
      <header>
        <h2>Academy Modules</h2>
        <p>Lazy-loaded feature module with optimized change detection.</p>
      </header>
      <router-outlet />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademyShellComponent {}
