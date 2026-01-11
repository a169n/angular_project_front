# Testing, Security & DevOps Plan

## Unit testing
- Use `TestBed` to validate `CourseStore` computed values.
- Mock `AcademyApiService` in component tests.

## E2E testing
- Verify navigation from dashboard to academy module.
- Validate lazy-loaded routes render within performance budgets.

## Security
- Use Angular sanitization in templates.
- Handle HTTP errors through interceptors.

## CI/CD
- Lint, test, and build via pipeline (e.g., GitHub Actions).
- Deploy to a static host with environment-specific `API_BASE_URL`.
