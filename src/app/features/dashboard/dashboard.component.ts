import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  NewTodoInput,
  TodoItem,
  TodoPriority,
  TodoStatus,
  TodoStore,
} from '../../data-access/todo-store.service';
import { InitiativeCardComponent } from './components/initiative-card.component';
import { MetricTileComponent } from './components/metric-tile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, InitiativeCardComponent, MetricTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard page">
      <header class="page-hero">
        <div>
          <p class="eyebrow">Today</p>
          <h2>Signal-driven to-do studio</h2>
          <p class="muted">
            Capture tasks, shape priorities, and push the most important work to the top.
          </p>
        </div>
        <div class="hero-card">
          <p class="hero-label">Focus score</p>
          <h3>{{ focusScore() }}%</h3>
          <p class="muted">Based on completed tasks in your current list.</p>
        </div>
      </header>

      <section class="metrics-grid">
        <app-metric-tile label="Open tasks" [value]="activeCount() + ''" trend="down" />
        <app-metric-tile label="In progress" [value]="inProgressCount() + ''" trend="up" />
        <app-metric-tile label="Due today" [value]="dueToday().length + ''" trend="steady" />
        <app-metric-tile label="Completed" [value]="completedCount() + ''" trend="up" />
      </section>

      <div class="dashboard-grid">
        <article class="panel planner">
          <h3>Create a task</h3>
          <p class="muted">Add a task and pick the right lane instantly.</p>
          <form class="planner-form" (submit)="addTodo($event)">
            <label class="planner-field">
              Title
              <input
                type="text"
                placeholder="Draft architecture brief"
                [value]="title()"
                (input)="title.set($any($event.target).value)"
              />
            </label>
            <label class="planner-field">
              Notes
              <input
                type="text"
                placeholder="Outline stakeholders, risks, and next steps"
                [value]="notes()"
                (input)="notes.set($any($event.target).value)"
              />
            </label>
            <div class="planner-inline">
              <label class="planner-field">
                Category
                <select [value]="category()" (change)="category.set($any($event.target).value)">
                  @for (option of categories; track option) {
                    <option [value]="option">{{ option }}</option>
                  }
                </select>
              </label>
              <label class="planner-field">
                Priority
                <select [value]="priority()" (change)="priority.set($any($event.target).value)">
                  @for (level of priorities; track level) {
                    <option [value]="level">{{ level }}</option>
                  }
                </select>
              </label>
              <label class="planner-field">
                Due
                <input
                  type="date"
                  [value]="dueDate()"
                  (input)="dueDate.set($any($event.target).value)"
                />
              </label>
            </div>
            <label class="planner-field">
              Status
              <select [value]="status()" (change)="status.set($any($event.target).value)">
                @for (lane of statuses; track lane) {
                  <option [value]="lane">{{ lane }}</option>
                }
              </select>
            </label>
            <button class="planner-button" type="submit" [disabled]="!title().trim()">
              Add task
            </button>
          </form>
        </article>

        <article
          class="panel drop-zone"
          [class.drag-over]="dropTarget() === 'due'"
          (dragover)="onDragOver($event, 'due')"
          (dragleave)="onDragLeave('due')"
          (drop)="onDropDue($event)"
        >
          <h3>Due today</h3>
          <p class="muted">Keep these on the radar before they slip.</p>
          <div class="task-list">
            @for (task of dueToday(); track task.id) {
              <div
                class="task-card"
                draggable="true"
                [class.dragging]="dragId() === task.id"
                (dragstart)="onDragStart(task.id)"
                (dragend)="onDragEnd()"
              >
                <div>
                  <strong>{{ task.title }}</strong>
                  <p class="muted">{{ task.notes }}</p>
                  <div class="task-meta">
                    <span class="chip">{{ task.category }}</span>
                    <span class="chip">{{ task.priority }} priority</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="ghost-button" (click)="setStatus(task, 'in-progress')">
                    Start
                  </button>
                  <button class="ghost-button" (click)="setStatus(task, 'done')">Done</button>
                </div>
              </div>
            } @empty {
              <p class="empty-state">No tasks due today.</p>
            }
          </div>
        </article>

        <article
          class="panel drop-zone"
          [class.drag-over]="dropTarget() === 'in-progress'"
          (dragover)="onDragOver($event, 'in-progress')"
          (dragleave)="onDragLeave('in-progress')"
          (drop)="onDropStatus($event, 'in-progress')"
        >
          <h3>In progress</h3>
          <p class="muted">Active tasks currently in motion.</p>
          <div class="task-list">
            @for (task of inProgress(); track task.id) {
              <div
                class="task-card"
                draggable="true"
                [class.dragging]="dragId() === task.id"
                (dragstart)="onDragStart(task.id)"
                (dragend)="onDragEnd()"
              >
                <div>
                  <strong>{{ task.title }}</strong>
                  <p class="muted">{{ task.notes }}</p>
                  <div class="task-meta">
                    <span class="chip">{{ task.category }}</span>
                    <span class="chip">Due {{ task.dueDate || 'TBD' }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="ghost-button" (click)="setStatus(task, 'todo')">Reset</button>
                  <button class="ghost-button" (click)="setStatus(task, 'done')">Done</button>
                </div>
              </div>
            } @empty {
              <p class="empty-state">No tasks in progress.</p>
            }
          </div>
        </article>

        <article
          class="panel drop-zone"
          [class.drag-over]="dropTarget() === 'todo'"
          (dragover)="onDragOver($event, 'todo')"
          (dragleave)="onDragLeave('todo')"
          (drop)="onDropStatus($event, 'todo')"
        >
          <h3>Backlog</h3>
          <p class="muted">Ideas waiting for the right moment.</p>
          <div class="task-list">
            @for (task of backlog(); track task.id) {
              <div
                class="task-card"
                draggable="true"
                [class.dragging]="dragId() === task.id"
                (dragstart)="onDragStart(task.id)"
                (dragend)="onDragEnd()"
              >
                <div>
                  <strong>{{ task.title }}</strong>
                  <p class="muted">{{ task.notes }}</p>
                  <div class="task-meta">
                    <span class="chip">{{ task.category }}</span>
                    <span class="chip">Due {{ task.dueDate || 'TBD' }}</span>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="ghost-button" (click)="setStatus(task, 'in-progress')">
                    Start
                  </button>
                  <button class="ghost-button" (click)="setStatus(task, 'done')">Done</button>
                </div>
              </div>
            } @empty {
              <p class="empty-state">Backlog is clear.</p>
            }
          </div>
        </article>
      </div>

      <section class="spotlight">
        <header class="spotlight-header">
          <div>
            <h3>Priority focus</h3>
            <p class="muted">Highest priority tasks across all categories.</p>
          </div>
          <span class="status-chip">High priority</span>
        </header>
        <div class="card-grid">
          @for (task of priorityFocus(); track task.id) {
            <app-initiative-card [todo]="task" />
          } @empty {
            <p class="empty-state">No high-priority tasks right now.</p>
          }
        </div>
      </section>
    </section>
  `,
})
export class DashboardComponent {
  private readonly todoStore = inject(TodoStore);

  readonly todos = this.todoStore.todos;
  readonly categories = ['Architecture', 'Performance', 'Reactive', 'Testing'];
  readonly priorities: TodoPriority[] = ['low', 'medium', 'high'];
  readonly statuses: TodoStatus[] = ['todo', 'in-progress', 'done'];

  readonly title = signal('');
  readonly notes = signal('');
  readonly category = signal(this.categories[0]);
  readonly priority = signal<TodoPriority>('medium');
  readonly dueDate = signal(this.todayIso());
  readonly status = signal<TodoStatus>('todo');
  readonly dragId = signal<string | null>(null);
  readonly dropTarget = signal<string | null>(null);

  readonly dueToday = computed(() => {
    const today = this.todayIso();
    return this.todos().filter((todo) => todo.dueDate === today && todo.status !== 'done');
  });
  readonly inProgress = computed(() =>
    this.todos().filter((todo) => todo.status === 'in-progress'),
  );
  readonly backlog = computed(() => this.todos().filter((todo) => todo.status === 'todo'));
  readonly priorityFocus = computed(() =>
    this.todos()
      .filter((todo) => todo.priority === 'high' && todo.status !== 'done')
      .slice(0, 3),
  );
  readonly focusScore = computed(() => {
    const total = this.todos().length;
    if (!total) {
      return 0;
    }
    const completed = this.todos().filter((todo) => todo.status === 'done').length;
    return Math.round((completed / total) * 100);
  });
  readonly activeCount = computed(
    () => this.todos().filter((todo) => todo.status !== 'done').length,
  );
  readonly inProgressCount = computed(
    () => this.todos().filter((todo) => todo.status === 'in-progress').length,
  );
  readonly completedCount = computed(
    () => this.todos().filter((todo) => todo.status === 'done').length,
  );

  addTodo(event: Event): void {
    event.preventDefault();
    const payload: NewTodoInput = {
      title: this.title(),
      notes: this.notes(),
      category: this.category(),
      dueDate: this.dueDate(),
      priority: this.priority(),
      status: this.status(),
    };
    if (!payload.title.trim()) {
      return;
    }
    this.todoStore.add(payload);
    this.title.set('');
    this.notes.set('');
    this.category.set(this.categories[0]);
    this.priority.set('medium');
    this.status.set('todo');
    this.dueDate.set(this.todayIso());
  }

  setStatus(task: TodoItem, status: TodoStatus): void {
    this.todoStore.setStatus(task.id, status);
  }

  onDragStart(id: string): void {
    this.dragId.set(id);
  }

  onDragEnd(): void {
    this.dragId.set(null);
    this.dropTarget.set(null);
  }

  onDragOver(event: DragEvent, target: string): void {
    event.preventDefault();
    this.dropTarget.set(target);
  }

  onDragLeave(target: string): void {
    if (this.dropTarget() === target) {
      this.dropTarget.set(null);
    }
  }

  onDropStatus(event: DragEvent, status: TodoStatus): void {
    event.preventDefault();
    const id = this.dragId();
    if (!id) {
      return;
    }
    this.todoStore.setStatus(id, status);
    this.onDragEnd();
  }

  onDropDue(event: DragEvent): void {
    event.preventDefault();
    const id = this.dragId();
    if (!id) {
      return;
    }
    this.todoStore.update(id, { dueDate: this.todayIso() });
    this.onDragEnd();
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
