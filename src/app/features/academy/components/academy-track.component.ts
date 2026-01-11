import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-academy-track',
  template: `
    <article class="track">
      <h3>Track Plan</h3>
      <ol>
        <li>Module 1: Architecture & Modularity</li>
        <li>Module 2: Performance & Optimization</li>
        <li>Module 3: Advanced TypeScript & RxJS</li>
        <li>Module 4: Testing, Security & DevOps</li>
      </ol>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademyTrackComponent {}
