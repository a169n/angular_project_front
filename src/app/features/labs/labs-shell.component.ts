import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-labs-shell',
  template: `
    <section class="labs">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Focus</p>
          <h2>Deep work sessions and archive</h2>
          <p class="muted">Zoom in on high-impact items and keep history tidy.</p>
        </div>
        <div class="hero-card compact">
          <p class="hero-label">Focus lanes</p>
          <h3>2</h3>
          <p class="muted">Priority and archive views.</p>
        </div>
      </header>
      <nav class="subnav">
        <a routerLink="/labs/catalog" routerLinkActive="active">Priority Focus</a>
        <a routerLink="/labs/incidents" routerLinkActive="active">Archive</a>
      </nav>
      <router-outlet />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabsShellComponent {}
