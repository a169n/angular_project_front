import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-tile',
  standalone: true,
  template: `
    <div class="metric-tile">
      <p class="label">{{ label }}</p>
      <h3>{{ value }}</h3>
      <span [class]="'trend ' + trend">{{ trend }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricTileComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) trend!: 'up' | 'down' | 'steady';
}
