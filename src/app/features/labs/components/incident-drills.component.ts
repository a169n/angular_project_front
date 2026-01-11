import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TodoStore } from '../../../data-access/todo-store.service';

@Component({
  selector: 'app-incident-drills',
  template: `
    <article class="panel">
      <h3>Archive</h3>
      <p class="muted">Completed tasks stay here for reference and reporting.</p>
      <table class="table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Category</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          @for (task of completed(); track task.id) {
            <tr>
              <td>{{ task.title }}</td>
              <td>{{ task.category }}</td>
              <td>{{ task.completedAt?.slice(0, 10) || 'Done' }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3" class="empty-state">No completed tasks yet.</td>
            </tr>
          }
        </tbody>
      </table>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDrillsComponent {
  private readonly store = inject(TodoStore);
  readonly completed = computed(() =>
    this.store
      .todos()
      .filter((todo) => todo.status === 'done')
      .slice(0, 12),
  );
}
