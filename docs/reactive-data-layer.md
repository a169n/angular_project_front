# Reactive Data Layer

## RxJS chains

- `AcademyApiService.loadReports()` demonstrates `switchMap`, `timeout`, `retry`, and `catchError`.
- A fallback response is returned on error to keep UI responsive.

## Centralized error handling

- `errorInterceptor` pushes notifications for failed HTTP requests.

## Type-safe API

- API responses use strongly typed interfaces (`AcademyReport`).
- Injection token `API_BASE_URL` keeps endpoints configurable.
