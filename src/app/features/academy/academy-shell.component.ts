import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-academy-shell',
  template: `
    <section class="academy">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Projects</p>
          <h2>Modular boards for every initiative</h2>
          <p class="muted">Organize tasks by discipline and keep ownership clear.</p>
        </div>
        <div class="hero-card compact">
          <p class="hero-label">Teams aligned</p>
          <h3>4</h3>
          <p class="muted">Architecture, Performance, Reactive, Testing.</p>
        </div>
      </header>
      <router-outlet />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademyShellComponent {}
