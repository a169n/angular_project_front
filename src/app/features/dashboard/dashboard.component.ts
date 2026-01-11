import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AcademyApiService } from '../../data-access/academy-api.service';
import { CourseStore } from '../../state/course.store';
import { Initiative, InitiativeCardComponent } from './components/initiative-card.component';
import { MetricTileComponent } from './components/metric-tile.component';

interface ActivityItem {
  title: string;
  detail: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AsyncPipe, InitiativeCardComponent, MetricTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard">
      <header class="dashboard-header">
        <div>
          <h2>Architecture & Performance Control Center</h2>
          <p>Signals-driven state, optimized change detection, and resilient RxJS pipelines.</p>
        </div>
        <div class="status-chip">Release train: <strong>Q3 Enterprise</strong></div>
      </header>

      <section class="metrics-grid">
        <app-metric-tile label="Bundle size" value="512 KB" trend="down" />
        <app-metric-tile label="LCP" value="1.8s" trend="up" />
        <app-metric-tile label="Error budget" value="92%" trend="steady" />
        <app-metric-tile label="Automation" value="74%" trend="up" />
      </section>

      <div class="dashboard-grid">
        <article class="panel">
          <h3>Learning Path (Signals)</h3>
          <ul class="list">
            @for (course of courses(); track course.id) {
              <li>
                <strong>{{ course.title }}</strong>
                <span>{{ course.durationMinutes }} min</span>
              </li>
            }
          </ul>
          <p>Total effort: {{ totalMinutes() }} minutes</p>
        </article>

        <article class="panel">
          <h3>Latest Reports (RxJS + retry/fallback)</h3>
          <ul class="list">
            @for (report of reports$ | async; track report.id) {
              <li>
                <strong>{{ report.title }}</strong>
                <span>{{ report.status }}</span>
              </li>
            }
          </ul>
        </article>

        <article class="panel">
          <h3>Strategic Initiatives</h3>
          <div class="card-grid">
            @for (initiative of initiatives; track initiative.title) {
              <app-initiative-card [initiative]="initiative" />
            }
          </div>
        </article>

        <article class="panel">
          <h3>Delivery Activity</h3>
          <ol class="activity">
            @for (item of activity; track item.title) {
              <li>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.detail }}</p>
                </div>
                <span>{{ item.time }}</span>
              </li>
            }
          </ol>
        </article>
      </div>
    </section>
  `,
})
export class DashboardComponent {
  private readonly api = inject(AcademyApiService);
  private readonly courseStore = inject(CourseStore);

  readonly courses = this.courseStore.courses;
  readonly totalMinutes = this.courseStore.totalMinutes;
  readonly reports$ = this.api.loadReports();

  readonly initiatives: Initiative[] = [
    { title: 'Standalone Migration', owner: 'Platform Team', status: 'on-track', progress: 76 },
    {
      title: 'Signal Store Adoption',
      owner: 'Architecture Guild',
      status: 'at-risk',
      progress: 52,
    },
    { title: 'CI Pipeline Hardening', owner: 'DevOps', status: 'delayed', progress: 34 },
  ];

  readonly activity: ActivityItem[] = [
    {
      title: 'OnPush rollout completed',
      detail: 'All feature modules updated with targeted change detection.',
      time: '2 hours ago',
    },
    {
      title: 'Lazy loading audit',
      detail: 'Identified 4 routes to split for faster initial load.',
      time: 'Yesterday',
    },
    {
      title: 'Security rehearsal',
      detail: 'XSS and CSRF mitigation checklist reviewed with QA.',
      time: '2 days ago',
    },
  ];
}
