import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NotificationService } from './shared/notification.service';
import { FeatureFlagService } from './core/services/feature-flag.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div>
        <h1>Enterprise Angular Academy</h1>
        <p>Advanced Frontend Architecture Demo</p>
      </div>
      <nav>
        <a routerLink="/">Dashboard</a>
        <a routerLink="/academy">Academy</a>
        <a routerLink="/labs">Labs</a>
      </nav>
      <button class="theme-toggle" type="button" (click)="toggleTheme()">
        {{ themeLabel() }}
      </button>
    </header>

    <main>
      <router-outlet />
    </main>

    @if (hasNotifications()) {
      <aside class="notifications">
        <h3>Notifications</h3>
        <ul>
          @for (note of notifications(); track $index) {
            <li>
              <strong>{{ note.title }}</strong>
              <span>{{ note.message }}</span>
            </li>
          }
        </ul>
      </aside>
    }

    <footer class="app-footer">
      <span>Performance mode: {{ performanceMode() }}</span>
    </footer>
  `,
})
export class AppComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly featureFlags = inject(FeatureFlagService);
  private readonly themeService = inject(ThemeService);

  readonly notifications = this.notificationService.items;
  readonly hasNotifications = computed(() => this.notifications().length > 0);
  readonly themeLabel = computed(() =>
    this.themeService.theme() === 'dark' ? 'Light mode' : 'Dark mode',
  );
  readonly performanceMode = computed(() =>
    this.featureFlags.isEnabled('performanceInsights') ? 'OnPush + Signals' : 'Default',
  );

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
