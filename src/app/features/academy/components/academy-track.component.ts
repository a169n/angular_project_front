import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  NewTodoInput,
  TodoItem,
  TodoPriority,
  TodoStatus,
  TodoStore,
} from '../../../data-access/todo-store.service';

interface BoardGroup {
  category: string;
  tasks: TodoItem[];
}

@Component({
  selector: 'app-academy-track',
  template: `
    <article class="panel planner">
      <h3>Create a project task</h3>
      <p class="muted">Route a task directly into the right team board.</p>
      <form class="planner-form" (submit)="addTask($event)">
        <label class="planner-field">
          Title
          <input
            type="text"
            placeholder="Define architecture review"
            [value]="title()"
            (input)="title.set($any($event.target).value)"
          />
        </label>
        <label class="planner-field">
          Notes
          <input
            type="text"
            placeholder="Capture the outcome and key stakeholders"
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
        <button class="planner-button" type="submit" [disabled]="!title().trim()">Add task</button>
      </form>
    </article>

    <section class="board-grid">
      @for (group of groups(); track group.category) {
        <article
          class="panel board drop-zone"
          [class.drag-over]="dropCategory() === group.category"
          (dragover)="onDragOverCategory($event, group.category)"
          (dragleave)="onDragLeaveCategory(group.category)"
          (drop)="onDropCategory($event, group.category)"
        >
          <header class="board-header">
            <h3>{{ group.category }}</h3>
            <span class="chip">{{ group.tasks.length }} open</span>
          </header>
          <div class="task-list">
            @for (task of group.tasks; track task.id) {
              <div
                class="task-card compact"
                draggable="true"
                [class.dragging]="dragId() === task.id"
                (dragstart)="onDragStart(task.id)"
                (dragend)="onDragEnd()"
              >
                <div>
                  <strong>{{ task.title }}</strong>
                  <p class="muted">{{ task.notes }}</p>
                  <div class="task-meta">
                    <span class="chip">{{ task.priority }} priority</span>
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
              <p class="empty-state">No tasks here yet.</p>
            }
          </div>
        </article>
      }
    </section>

    <section class="panel archive">
      <header class="board-header">
        <h3>Completed delivery</h3>
        <span class="chip">{{ completed().length }} shipped</span>
      </header>
      <ul class="list">
        @for (task of completed(); track task.id) {
          <li>
            <div>
              <strong>{{ task.title }}</strong>
              <span class="pill">{{ task.category }}</span>
            </div>
            <span class="muted">Done {{ task.completedAt?.slice(0, 10) }}</span>
          </li>
        } @empty {
          <li class="empty-state">No completed tasks yet.</li>
        }
      </ul>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademyTrackComponent {
  private readonly store = inject(TodoStore);

  readonly todos = this.store.todos;
  readonly completed = computed(() =>
    this.todos()
      .filter((todo) => todo.status === 'done')
      .slice(0, 6),
  );

  readonly categories = ['Architecture', 'Performance', 'Reactive', 'Testing'];
  readonly priorities: TodoPriority[] = ['low', 'medium', 'high'];

  readonly title = signal('');
  readonly notes = signal('');
  readonly category = signal(this.categories[0]);
  readonly priority = signal<TodoPriority>('medium');
  readonly dueDate = signal(this.todayIso());
  readonly dragId = signal<string | null>(null);
  readonly dropCategory = signal<string | null>(null);

  readonly groups = computed<BoardGroup[]>(() =>
    this.categories.map((category) => ({
      category,
      tasks: this.todos().filter((todo) => todo.category === category && todo.status !== 'done'),
    })),
  );

  addTask(event: Event): void {
    event.preventDefault();
    const payload: NewTodoInput = {
      title: this.title(),
      notes: this.notes(),
      category: this.category(),
      dueDate: this.dueDate(),
      priority: this.priority(),
      status: 'todo',
    };
    if (!payload.title.trim()) {
      return;
    }
    this.store.add(payload);
    this.title.set('');
    this.notes.set('');
    this.category.set(this.categories[0]);
    this.priority.set('medium');
    this.dueDate.set(this.todayIso());
  }

  setStatus(task: TodoItem, status: TodoStatus): void {
    this.store.setStatus(task.id, status);
  }

  onDragStart(id: string): void {
    this.dragId.set(id);
  }

  onDragEnd(): void {
    this.dragId.set(null);
    this.dropCategory.set(null);
  }

  onDragOverCategory(event: DragEvent, category: string): void {
    event.preventDefault();
    this.dropCategory.set(category);
  }

  onDragLeaveCategory(category: string): void {
    if (this.dropCategory() === category) {
      this.dropCategory.set(null);
    }
  }

  onDropCategory(event: DragEvent, category: string): void {
    event.preventDefault();
    const id = this.dragId();
    if (!id) {
      return;
    }
    this.store.setCategory(id, category);
    this.onDragEnd();
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
