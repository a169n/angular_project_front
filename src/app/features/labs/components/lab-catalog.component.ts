import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TodoStore } from '../../../data-access/todo-store.service';

@Component({
  selector: 'app-lab-catalog',
  template: `
    <article class="panel">
      <h3>Priority focus</h3>
      <p class="muted">High-priority tasks sorted for deep work sessions.</p>
      <div class="task-list">
        @for (task of focusTasks(); track task.id) {
          <div class="task-card">
            <div>
              <strong>{{ task.title }}</strong>
              <p class="muted">{{ task.notes }}</p>
              <div class="task-meta">
                <span class="chip">{{ task.category }}</span>
                <span class="chip">Due {{ task.dueDate || 'TBD' }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button class="ghost-button" (click)="setStatus(task.id, 'in-progress')">
                Start
              </button>
              <button class="ghost-button" (click)="setStatus(task.id, 'done')">Done</button>
            </div>
          </div>
        } @empty {
          <p class="empty-state">No high-priority tasks right now.</p>
        }
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabCatalogComponent {
  private readonly store = inject(TodoStore);

  readonly focusTasks = computed(() =>
    this.store
      .todos()
      .filter((todo) => todo.priority === 'high' && todo.status !== 'done')
      .slice(0, 6),
  );

  setStatus(id: string, status: 'in-progress' | 'done'): void {
    this.store.setStatus(id, status);
  }
}
