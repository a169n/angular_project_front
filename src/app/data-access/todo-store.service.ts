import { Injectable, computed, signal } from '@angular/core';

export type TodoStatus = 'todo' | 'in-progress' | 'done';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface TodoItem {
  id: string;
  title: string;
  notes: string;
  category: string;
  dueDate: string;
  priority: TodoPriority;
  status: TodoStatus;
  createdAt: string;
  completedAt?: string;
}

export interface NewTodoInput {
  title: string;
  notes: string;
  category: string;
  dueDate: string;
  priority: TodoPriority;
  status?: TodoStatus;
}

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly storageKey = 'enterprise-todo-items';
  private readonly _todos = signal<TodoItem[]>(this.loadInitial());

  readonly todos = this._todos.asReadonly();
  readonly active = computed(() => this._todos().filter((todo) => todo.status !== 'done'));
  readonly completed = computed(() => this._todos().filter((todo) => todo.status === 'done'));

  add(input: NewTodoInput): void {
    const todo: TodoItem = {
      id: this.createId(),
      title: this.sanitizeText(input.title),
      notes: this.sanitizeText(input.notes),
      category: this.sanitizeText(input.category),
      dueDate: input.dueDate,
      priority: input.priority,
      status: input.status ?? 'todo',
      createdAt: new Date().toISOString(),
    };
    const next = [todo, ...this._todos()];
    this._todos.set(next);
    this.persist(next);
  }

  update(id: string, patch: Partial<TodoItem>): void {
    const next = this._todos().map((todo) => {
      if (todo.id !== id) {
        return todo;
      }
      const sanitized: Partial<TodoItem> = { ...patch };
      if (typeof sanitized.title === 'string') {
        sanitized.title = this.sanitizeText(sanitized.title);
      }
      if (typeof sanitized.notes === 'string') {
        sanitized.notes = this.sanitizeText(sanitized.notes);
      }
      if (typeof sanitized.category === 'string') {
        sanitized.category = this.sanitizeText(sanitized.category);
      }
      return { ...todo, ...sanitized };
    });
    this._todos.set(next);
    this.persist(next);
  }

  setStatus(id: string, status: TodoStatus): void {
    const completedAt = status === 'done' ? new Date().toISOString() : undefined;
    this.update(id, { status, completedAt });
  }

  setCategory(id: string, category: string): void {
    this.update(id, { category });
  }

  remove(id: string): void {
    const next = this._todos().filter((todo) => todo.id !== id);
    this._todos.set(next);
    this.persist(next);
  }

  private loadInitial(): TodoItem[] {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as TodoItem[];
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          return this.seed();
        }
      }
    }
    return this.seed();
  }

  private persist(todos: TodoItem[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(todos));
    }
  }

  private seed(): TodoItem[] {
    return [
      {
        id: this.createId(),
        title: 'Refactor onboarding checklist',
        notes: 'Focus on the first-run tasks and handoff doc.',
        category: 'Architecture',
        dueDate: this.offsetDate(1),
        priority: 'high',
        status: 'in-progress',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.createId(),
        title: 'Ship performance scoreboard',
        notes: 'Include LCP, TTI, and bundle size targets.',
        category: 'Performance',
        dueDate: this.offsetDate(3),
        priority: 'medium',
        status: 'todo',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.createId(),
        title: 'Design error resilience flow',
        notes: 'Retry, fallback, and user messaging.',
        category: 'Reactive',
        dueDate: this.offsetDate(0),
        priority: 'high',
        status: 'todo',
        createdAt: new Date().toISOString(),
      },
      {
        id: this.createId(),
        title: 'Review security scenarios',
        notes: 'XSS and CSRF coverage for key forms.',
        category: 'Testing',
        dueDate: this.offsetDate(5),
        priority: 'low',
        status: 'todo',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  private createId(): string {
    return `todo_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
  }

  private offsetDate(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().slice(0, 10);
  }

  private sanitizeText(value: string): string {
    return (
      value
        .replace(/<[^>]*>/g, '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1f\x7f]/g, '')
        .trim()
    );
  }
}
