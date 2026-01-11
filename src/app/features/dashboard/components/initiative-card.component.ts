import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface Initiative {
  title: string;
  owner: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  progress: number;
}

@Component({
  selector: 'app-initiative-card',
  standalone: true,
  template: `
    <div class="card">
      <header>
        <h4>{{ initiative.title }}</h4>
        <span class="status" [class]="initiative.status">{{ initiative.status }}</span>
      </header>
      <p>Owner: {{ initiative.owner }}</p>
      <div class="progress">
        <div class="progress-bar" [style.width.%]="initiative.progress"></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitiativeCardComponent {
  @Input({ required: true }) initiative!: Initiative;
}
