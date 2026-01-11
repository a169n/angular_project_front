import { ChangeDetectionStrategy, Component } from '@angular/core';

interface DrillItem {
  scenario: string;
  owner: string;
  status: string;
}

@Component({
  selector: 'app-incident-drills',
  template: `
    <article class="panel">
      <h3>Incident Drill Schedule</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let drill of drills">
            <td>{{ drill.scenario }}</td>
            <td>{{ drill.owner }}</td>
            <td>{{ drill.status }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDrillsComponent {
  readonly drills: DrillItem[] = [
    { scenario: 'XSS response simulation', owner: 'Security', status: 'Planned' },
    { scenario: 'CI outage recovery', owner: 'DevOps', status: 'In progress' },
    { scenario: 'API latency spike', owner: 'Platform', status: 'Completed' },
  ];
}
