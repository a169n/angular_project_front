# Enterprise Angular Architecture Decisions

## Modular structure
- `core/` contains cross-cutting concerns (routing config, tokens, interceptors).
- `shared/` hosts reusable UI utilities and services (notifications).
- `features/` contains bounded contexts with lazy loading (`academy`).
- `features/labs` adds an operational lab module with nested routes.
- `state/` contains signal-based stores (`CourseStore`).

## Standalone components
- `AppComponent` and `DashboardComponent` are standalone to reduce module boilerplate.
- Standalone components are lazy-loaded using `loadComponent` in `app.routes.ts`.

## Dependency injection
- `API_BASE_URL` is provided as an injection token with an app-level provider.
- `FeatureFlagService` demonstrates DI with scoped configuration.
- `ThemeService` persists light/dark mode and applies it to the root document.

## State management
- Signals are used via `CourseStore` and `NotificationService`.
- Computed values (`totalMinutes`, `hasNotifications`) keep templates lean.
