import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-labs-shell',
  template: `
    <section class="labs">
      <header>
        <h2>Performance & Security Labs</h2>
        <p>Hands-on experiments and incident response drills.</p>
      </header>
      <nav class="subnav">
        <a routerLink="/labs/catalog">Catalog</a>
        <a routerLink="/labs/incidents">Incident Drills</a>
      </nav>
      <router-outlet />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabsShellComponent {}
