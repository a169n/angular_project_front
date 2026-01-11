import { ChangeDetectionStrategy, Component } from '@angular/core';

interface LabItem {
  title: string;
  focus: string;
  duration: string;
}

@Component({
  selector: 'app-lab-catalog',
  template: `
    <article class="panel">
      <h3>Lab Catalog</h3>
      <ul class="list">
        <li *ngFor="let lab of labs">
          <strong>{{ lab.title }}</strong>
          <span>{{ lab.focus }} · {{ lab.duration }}</span>
        </li>
      </ul>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabCatalogComponent {
  readonly labs: LabItem[] = [
    { title: 'Change Detection Profiling', focus: 'Performance', duration: '90 min' },
    { title: 'RxJS Resilience Suite', focus: 'Reactive', duration: '120 min' },
    { title: 'Security Threat Modeling', focus: 'Security', duration: '60 min' },
  ];
}
