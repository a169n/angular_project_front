# Angular Performance Improvement Case

## Change detection strategy
- All components use `ChangeDetectionStrategy.OnPush`.
- `provideZoneChangeDetection` enables event/run coalescing.

## Template optimizations
- `AsyncPipe` is used to manage RxJS subscriptions in templates.
- Computed signals reduce redundant calculations.
- Responsive grid layouts reduce DOM churn on smaller devices.

## Lazy loading
- `academy` feature module is lazy-loaded via `loadChildren` in `app.routes.ts`.
- `dashboard` is lazy-loaded using `loadComponent` for a standalone component.

## Metrics to compare
- Bundle size before/after lazy loading.
- Initial render time before/after OnPush.
