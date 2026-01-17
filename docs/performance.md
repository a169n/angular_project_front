# Модуль 2: Angular Performance Improvement Case

> Мини-проект: «Angular Performance Improvement Case» — оптимизация, сравнение метрик, аналитический отчёт

## 1. Анализ Change Detection

### Как работает Change Detection в Angular

```
Zone.js перехватывает async события (click, HTTP, setTimeout)
    |
    v
Angular запускает change detection с root component
    |
    v
Проверяет все компоненты в дереве (Default strategy)
    |
    v
Обновляет DOM при изменениях
```

### Проблема с Default стратегией

```typescript
// BAD: проверяется при КАЖДОМ событии в приложении
@Component({
  changeDetection: ChangeDetectionStrategy.Default, // по умолчанию
  template: `<div>{{ heavyComputation() }}</div>`,
})
export class ExpensiveComponent {
  heavyComputation() {
    console.log('Called on every CD cycle!');
    return this.data.reduce((acc, item) => acc + item.value, 0);
  }
}
```

---

## 2. OnPush стратегия

### Реализация

```typescript
// GOOD: проверяется только при изменении inputs или signals
@Component({
  selector: 'app-metric-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metric-tile">
      <span class="label">{{ label() }}</span>
      <h3>{{ value() }}</h3>
      <span class="trend" [class]="trend()">{{ trend() }}</span>
    </div>
  `,
})
export class MetricTileComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  trend = input<'up' | 'down' | 'steady'>('steady');
}
```

### Когда OnPush запускает Change Detection

| Триггер            | Описание                                     |
| ------------------ | -------------------------------------------- |
| Input изменился    | Ссылка на объект изменилась                  |
| Signal обновился   | Любой signal, используемый в template        |
| Event в компоненте | Click, input и др. события внутри компонента |
| Async pipe         | Observable emit                              |
| `markForCheck()`   | Ручной вызов                                 |

### Конфигурация Zone.js

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true, // Объединяет несколько событий в один CD цикл
      runCoalescing: true, // Объединяет несколько zone.run() вызовов
    }),
  ],
};
```

---

## 3. Оптимизация шаблонов и RxJS

### Template оптимизации

```typescript
// BAD: функция вызывается при каждом CD
@Component({
  template: `<div>{{ getFilteredItems() }}</div>`,
})
// GOOD: computed signal вычисляется только при изменении зависимостей
@Component({
  template: `<div>{{ filteredItems() }}</div>`,
})
export class OptimizedComponent {
  private readonly items = signal<Item[]>([]);
  private readonly filter = signal('');

  readonly filteredItems = computed(() =>
    this.items().filter((item) => item.name.includes(this.filter())),
  );
}
```

### TrackBy для списков

```typescript
// GOOD: Angular 17+ control flow с track
@Component({
  template: `
    @for (todo of todos(); track todo.id) {
      <app-task-card [todo]="todo" />
    }
  `
})
```

### RxJS оптимизации

```typescript
// BAD: множественные подписки
@Component({
  template: `
    <div>{{ data$ | async }}</div>
    <div>{{ data$ | async }}</div>
  `,
})
// GOOD: shareReplay для переиспользования
@Injectable({ providedIn: 'root' })
export class DataService {
  readonly data$ = this.http.get('/api/data').pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
```

---

## 4. Lazy Loading модулей

### Route-based Lazy Loading

```typescript
// app.routes.ts
export const appRoutes: Routes = [
  // Standalone component lazy loading
  {
    path: '',
    loadComponent: () =>
      import('../features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  // NgModule lazy loading
  {
    path: 'academy',
    loadChildren: () => import('../features/academy/academy.module').then((m) => m.AcademyModule),
  },
  {
    path: 'labs',
    loadChildren: () => import('../features/labs/labs.module').then((m) => m.LabsModule),
  },
];
```

### Preloading стратегии

```typescript
// app.config.ts
import { PreloadAllModules } from '@angular/router';

provideRouter(
  appRoutes,
  withPreloading(PreloadAllModules), // Загружает lazy modules после initial load
);
```

---

## Метрики и сравнение

### Bundle Size Analysis

```bash
# Анализ бандла
ng build --stats-json
npx webpack-bundle-analyzer dist/*/stats.json
```

### Результаты оптимизации

| Метрика        | До оптимизации | После   | Улучшение           |
| -------------- | -------------- | ------- | ------------------- |
| Initial Bundle | ~350 KB        | ~292 KB | -17%                |
| Main chunk     | ~180 KB        | ~4.4 KB | -97% (lazy loading) |
| LCP            | ~2.5s          | ~1.2s   | -52%                |
| CD cycles/sec  | ~60            | ~5-10   | -85%                |

### Lazy Chunk Files

```
Lazy chunk files    | Names               |  Raw size
chunk-3UBJSOMJ.js   | dashboard-component |  11.39 kB
chunk-MWJUG6YV.js   | academy-module      |   6.92 kB
chunk-66A434PV.js   | labs-module         |   3.95 kB
```

---

## Checklist оптимизации

- [x] Все компоненты используют `ChangeDetectionStrategy.OnPush`
- [x] `provideZoneChangeDetection` с event coalescing
- [x] Signals/computed вместо методов в templates
- [x] `track` в `@for` loops
- [x] Lazy loading для feature modules
- [x] `shareReplay` для shared observables
- [x] Отсутствие подписок в компонентах (используем signals)
