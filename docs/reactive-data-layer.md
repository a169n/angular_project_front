# Модуль 3: Reactive Data Layer

> Мини-проект: «Reactive Data Layer» — RxJS-архитектура, type-safe API, устойчивость к ошибкам

## 1. Сложные RxJS-цепочки

### Пример: загрузка данных с retry и fallback

```typescript
// academy-api.service.ts
@Injectable({ providedIn: 'root' })
export class AcademyApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_BASE_URL);

  loadReports(): Observable<AcademyReport[]> {
    return this.http.get<AcademyReport[]>(`${this.apiUrl}/reports`).pipe(
      // Timeout после 10 секунд
      timeout(10000),

      // Retry 3 раза с exponential backoff
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.warn(`Retry attempt ${retryCount}`);
          return timer(Math.pow(2, retryCount) * 1000); // 2s, 4s, 8s
        },
        resetOnSuccess: true,
      }),

      // Fallback при ошибке
      catchError((error) => {
        console.error('Failed to load reports:', error);
        return of(this.getFallbackReports());
      }),

      // Кэширование результата
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private getFallbackReports(): AcademyReport[] {
    return [{ id: 'fallback', title: 'Offline Mode', status: 'cached' }];
  }
}
```

### Операторы для сложных сценариев

```typescript
// Поиск с debounce и отменой предыдущих запросов
searchTodos(query$: Observable<string>): Observable<TodoItem[]> {
  return query$.pipe(
    debounceTime(300),           // Ждём 300ms после последнего ввода
    distinctUntilChanged(),       // Игнорируем одинаковые значения
    filter(q => q.length >= 2),   // Минимум 2 символа
    switchMap(query =>            // Отменяем предыдущий запрос
      this.http.get<TodoItem[]>(`/api/todos?q=${query}`).pipe(
        catchError(() => of([]))  // Fallback на пустой массив
      )
    )
  );
}

// Параллельные запросы
loadDashboardData(): Observable<DashboardData> {
  return forkJoin({
    todos: this.todoService.getAll(),
    metrics: this.metricsService.getCurrent(),
    notifications: this.notificationService.getRecent(),
  }).pipe(
    timeout(5000),
    catchError(() => of({ todos: [], metrics: null, notifications: [] }))
  );
}
```

---

## 2. Централизованная обработка ошибок

### HTTP Interceptor

```typescript
// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Классификация ошибок
      const errorInfo = classifyError(error);

      // Уведомление пользователя
      notifications.push({
        title: errorInfo.title,
        message: errorInfo.message,
        level: errorInfo.level,
      });

      // Редирект при 401/403
      if (error.status === 401) {
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};

function classifyError(error: HttpErrorResponse): ErrorInfo {
  switch (error.status) {
    case 0:
      return { title: 'Network Error', message: 'Check your connection', level: 'error' };
    case 400:
      return {
        title: 'Bad Request',
        message: error.error?.message || 'Invalid data',
        level: 'warning',
      };
    case 401:
      return { title: 'Unauthorized', message: 'Please login', level: 'warning' };
    case 403:
      return { title: 'Forbidden', message: 'Access denied', level: 'error' };
    case 404:
      return { title: 'Not Found', message: 'Resource not found', level: 'warning' };
    case 500:
      return { title: 'Server Error', message: 'Please try again later', level: 'error' };
    default:
      return { title: 'Error', message: error.message, level: 'error' };
  }
}
```

### Notification Service

```typescript
// notification.service.ts
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<NotificationItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly hasNotifications = computed(() => this._items().length > 0);

  push(notification: Omit<NotificationItem, 'id' | 'timestamp'>): void {
    const item: NotificationItem = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this._items.update((items) => [...items, item]);

    // Auto-dismiss после 5 секунд для не-error уведомлений
    if (notification.level !== 'error') {
      setTimeout(() => this.dismiss(item.id), 5000);
    }
  }

  dismiss(id: string): void {
    this._items.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this._items.set([]);
  }
}
```

---

## 3. Type-safe API

### Строго типизированные интерфейсы

```typescript
// models/todo.model.ts
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

// Type guard
export function isTodoItem(obj: unknown): obj is TodoItem {
  return (
    typeof obj === 'object' && obj !== null && 'id' in obj && 'title' in obj && 'status' in obj
  );
}
```

### Typed HTTP Service

```typescript
// api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // Generic typed methods
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  post<T, R>(endpoint: string, body: T): Observable<R> {
    return this.http.post<R>(`${this.baseUrl}${endpoint}`, body);
  }

  patch<T, R>(endpoint: string, body: Partial<T>): Observable<R> {
    return this.http.patch<R>(`${this.baseUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}

// Usage
@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly api = inject(ApiService);

  getAll(): Observable<TodoItem[]> {
    return this.api.get<TodoItem[]>('/todos');
  }

  create(input: NewTodoInput): Observable<TodoItem> {
    return this.api.post<NewTodoInput, TodoItem>('/todos', input);
  }

  update(id: string, patch: Partial<TodoItem>): Observable<TodoItem> {
    return this.api.patch<TodoItem, TodoItem>(`/todos/${id}`, patch);
  }
}
```

---

## 4. Retry / Fallback механика

### Retry стратегии

```typescript
// retry-strategies.ts

// Exponential backoff
export const exponentialBackoff = (maxRetries: number) =>
  retry({
    count: maxRetries,
    delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000),
  });

// Retry только для определённых ошибок
export const retryOnServerError = retry({
  count: 3,
  delay: (error: HttpErrorResponse) => {
    if (error.status >= 500) {
      return timer(2000);
    }
    return throwError(() => error); // Не retry для 4xx
  },
});

// Retry с уведомлением
export const retryWithNotification = (notifications: NotificationService) =>
  retry({
    count: 3,
    delay: (error, retryCount) => {
      notifications.push({
        title: 'Retrying...',
        message: `Attempt ${retryCount} of 3`,
        level: 'info',
      });
      return timer(2000);
    },
  });
```

### Fallback паттерны

```typescript
// Fallback на кэшированные данные
loadWithCache(): Observable<Data[]> {
  return this.http.get<Data[]>('/api/data').pipe(
    tap(data => this.cache.set('data', data)),
    catchError(() => {
      const cached = this.cache.get('data');
      return cached ? of(cached) : of([]);
    })
  );
}

// Fallback на альтернативный endpoint
loadWithFallbackEndpoint(): Observable<Data[]> {
  return this.http.get<Data[]>('/api/v2/data').pipe(
    catchError(() => this.http.get<Data[]>('/api/v1/data')),
    catchError(() => of([]))
  );
}

// Graceful degradation
loadDashboard(): Observable<DashboardState> {
  return forkJoin({
    critical: this.loadCriticalData(),
    optional: this.loadOptionalData().pipe(catchError(() => of(null))),
  });
}
```

---

## RxJS Best Practices

| Практика               | Описание                                              |
| ---------------------- | ----------------------------------------------------- |
| `takeUntilDestroyed()` | Автоматическая отписка в компонентах                  |
| `shareReplay`          | Кэширование для shared observables                    |
| `switchMap`            | Отмена предыдущих запросов при новых                  |
| `exhaustMap`           | Игнорирование новых запросов пока текущий не завершён |
| `catchError`           | Всегда на уровне сервиса, не компонента               |
| Typed generics         | `Observable<T>` вместо `Observable<any>`              |
