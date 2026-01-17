# Модуль 1: Enterprise Angular Architecture

> Мини-проект: «Enterprise Angular Architecture» — модульная архитектура, state management, документация решений

## 1. Модульная структура приложения

### Структура директорий

```
src/app/
├── core/                    # Singleton сервисы, guards, interceptors
│   ├── app.config.ts        # Провайдеры приложения
│   ├── app.routes.ts        # Маршрутизация
│   ├── interceptors/        # HTTP interceptors
│   ├── services/            # Core services (FeatureFlag, Theme)
│   └── tokens.ts            # Injection tokens
├── data-access/             # Stores и data services
│   └── todo-store.service.ts
├── features/                # Feature modules (lazy-loaded)
│   ├── academy/             # NgModule-based feature
│   ├── dashboard/           # Standalone component feature
│   └── labs/                # NgModule with nested routes
├── shared/                  # Reusable utilities
│   ├── notification.service.ts
│   ├── sanitize-html.pipe.ts
│   └── not-found.component.ts
└── state/                   # Global state management
```

### Принципы разделения

| Слой           | Назначение                        | Пример                                |
| -------------- | --------------------------------- | ------------------------------------- |
| `core/`        | Singleton сервисы, конфигурация   | `ThemeService`, `errorInterceptor`    |
| `data-access/` | Управление данными и состоянием   | `TodoStore`                           |
| `features/`    | Bounded contexts, lazy-loaded     | `AcademyModule`, `DashboardComponent` |
| `shared/`      | Переиспользуемые компоненты/pipes | `SanitizeHtmlPipe`                    |

---

## 2. Standalone Components

### Реализация

```typescript
// dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MetricTileComponent, InitiativeCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class DashboardComponent {
  private readonly store = inject(TodoStore);
  readonly todos = this.store.todos;
  readonly active = this.store.active;
}
```

### Преимущества Standalone

- **Без NgModule boilerplate** — компоненты самодостаточны
- **Tree-shakable** — только используемые зависимости попадают в бандл
- **Lazy loading** — `loadComponent()` для отдельных компонентов

```typescript
// app.routes.ts
{
  path: '',
  loadComponent: () =>
    import('../features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
}
```

---

## 3. Dependency Injection

### Injection Tokens

```typescript
// tokens.ts
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://api.example.com',
});
```

### Использование inject()

```typescript
// Современный подход (Angular 14+)
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);
}

// В Pipe
@Pipe({ name: 'sanitizeHtml', standalone: true })
export class SanitizeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);
}
```

### Иерархия провайдеров

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: API_BASE_URL, useValue: environment.apiUrl },
  ],
};
```

---

## 4. State Management с Signals

### Signal-based Store

```typescript
// todo-store.service.ts
@Injectable({ providedIn: 'root' })
export class TodoStore {
  // Private writable signal
  private readonly _todos = signal<TodoItem[]>(this.loadInitial());

  // Public readonly signals
  readonly todos = this._todos.asReadonly();

  // Computed signals для derived state
  readonly active = computed(() => this._todos().filter((todo) => todo.status !== 'done'));

  readonly completed = computed(() => this._todos().filter((todo) => todo.status === 'done'));

  // Actions
  add(input: NewTodoInput): void {
    const todo = this.createTodo(input);
    this._todos.update((todos) => [todo, ...todos]);
    this.persist();
  }

  setStatus(id: string, status: TodoStatus): void {
    this._todos.update((todos) =>
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status,
              completedAt: status === 'done' ? new Date().toISOString() : undefined,
            }
          : todo,
      ),
    );
    this.persist();
  }
}
```

### Преимущества Signals vs NgRx

| Критерий       | Signals               | NgRx                                      |
| -------------- | --------------------- | ----------------------------------------- |
| Boilerplate    | Минимальный           | Значительный (actions, reducers, effects) |
| Learning curve | Низкий                | Высокий                                   |
| DevTools       | Встроенные в Angular  | Redux DevTools                            |
| Подходит для   | Малые/средние проекты | Enterprise с complex state                |

### Использование в компонентах

```typescript
@Component({
  template: `
    <div class="metrics-grid">
      <app-metric-tile label="Active" [value]="store.active().length" />
      <app-metric-tile label="Completed" [value]="store.completed().length" />
    </div>

    @for (todo of store.todos(); track todo.id) {
      <app-task-card [todo]="todo" (statusChange)="onStatusChange($event)" />
    }
  `,
})
export class DashboardComponent {
  readonly store = inject(TodoStore);
}
```

---

## Архитектурные решения

### Почему эта структура?

1. **Separation of Concerns** — каждый слой имеет чёткую ответственность
2. **Scalability** — легко добавлять новые features без изменения core
3. **Testability** — DI позволяет легко мокать зависимости
4. **Performance** — lazy loading уменьшает initial bundle

### Trade-offs

| Решение               | Плюсы                  | Минусы                                       |
| --------------------- | ---------------------- | -------------------------------------------- |
| Standalone components | Простота, tree-shaking | Нет shared NgModule для общих imports        |
| Signals вместо NgRx   | Простота, меньше кода  | Нет time-travel debugging                    |
| Feature modules       | Изоляция, lazy loading | Дополнительная сложность для мелких features |
