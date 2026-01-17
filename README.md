# Production-Grade Angular Application

> Advanced Frontend (Angular) — Enterprise Architecture, Performance, Reactive Data, Testing & DevOps

## Обзор проекта

Данный репозиторий демонстрирует production-ready Angular приложение, соответствующее требованиям курса **Advanced Frontend (Angular)**.

## Структура модулей

### Модуль 1: Архитектура и модульность

- Модульная структура (`core/`, `shared/`, `features/`, `data-access/`)
- Standalone Components с lazy loading
- Dependency Injection с `inject()` и `InjectionToken`
- State Management с Angular Signals

См. [architecture.md](docs/architecture.md)

### Модуль 2: Производительность и оптимизация

- `ChangeDetectionStrategy.OnPush` во всех компонентах
- `provideZoneChangeDetection` с event coalescing
- Computed signals вместо методов в templates
- Lazy Loading модулей и компонентов

См. [performance.md](docs/performance.md)

### Модуль 3: Advanced TypeScript и RxJS

- RxJS-цепочки с `switchMap`, `retry`, `timeout`, `catchError`
- Централизованная обработка ошибок через HTTP Interceptor
- Type-safe API с строгой типизацией
- Retry/fallback механика

См. [reactive-data-layer.md](docs/reactive-data-layer.md)

### Модуль 4: Тестирование, безопасность и DevOps

- Unit-тесты (Jest) для services и components
- E2E-тесты (Playwright) для user flows
- XSS защита (санитизация, `DomSanitizer`)
- CI/CD pipeline (GitHub Actions)

См. [testing-security-devops.md](docs/testing-security-devops.md)

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev server
npm start

# Unit тесты
npm test

# E2E тесты
npm run e2e

# Lint
npm run lint

# Production build
npm run build
```

## Архитектура

```
src/app/
├── core/                    # Singleton services, config, interceptors
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── interceptors/
│   └── services/
├── data-access/             # Signal-based stores
│   └── todo-store.service.ts
├── features/                # Lazy-loaded feature modules
│   ├── academy/
│   ├── dashboard/
│   └── labs/
├── shared/                  # Reusable components, pipes, services
│   ├── notification.service.ts
│   └── sanitize-html.pipe.ts
└── state/                   # Global state (if needed)
```

## Технологии

| Категория    | Технология                                 |
| ------------ | ------------------------------------------ |
| Framework    | Angular 17                                 |
| State        | Angular Signals                            |
| Routing      | Lazy Loading (loadComponent, loadChildren) |
| Testing      | Jest (unit), Playwright (e2e)              |
| CI/CD        | GitHub Actions                             |
| Code Quality | ESLint, Prettier                           |

## Документация

| Файл                                                          | Описание                            |
| ------------------------------------------------------------- | ----------------------------------- |
| [architecture.md](docs/architecture.md)                       | Модульная архитектура, DI, Signals  |
| [performance.md](docs/performance.md)                         | OnPush, Lazy Loading, оптимизации   |
| [reactive-data-layer.md](docs/reactive-data-layer.md)         | RxJS, error handling, type-safe API |
| [testing-security-devops.md](docs/testing-security-devops.md) | Тесты, XSS/CSRF, CI/CD              |

## Скрипты

```bash
npm start           # Dev server на localhost:4200
npm run build       # Production build
npm test            # Unit тесты (Jest)
npm run e2e         # E2E тесты (Playwright)
npm run lint        # ESLint проверка
npm run format      # Prettier форматирование
npm run format:check # Проверка форматирования
```

## CI/CD Pipeline

```
Push -> Format Check -> Lint -> Unit Tests -> Build -> E2E Tests -> Deploy
```

## Лицензия

MIT
