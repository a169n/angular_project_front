# Модуль 4: Testing, Security & DevOps

> Итоговый проект: «Production-Grade Angular Application» — тестовое покрытие, безопасность, автоматизированный деплой

## 1. Unit-тестирование компонентов и сервисов

### Настройка Jest

```typescript
// angular.json
{
  "test": {
    "builder": "@angular-devkit/build-angular:jest",
    "options": {
      "tsConfig": "tsconfig.spec.json",
      "polyfills": ["zone.js", "zone.js/testing"],
      "include": ["src/**/*.spec.ts"]
    }
  }
}
```

### Тестирование Signal-based Store

```typescript
// todo-store.service.spec.ts
describe('TodoStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds a new todo with trimmed fields', () => {
    const store = new TodoStore();

    store.add({
      title: '  Ship release  ',
      notes: '  Add release notes  ',
      category: 'Delivery',
      dueDate: '2024-01-01',
      priority: 'high',
    });

    const [latest] = store.todos();
    expect(latest.title).toBe('Ship release');
    expect(latest.notes).toBe('Add release notes');
    expect(latest.status).toBe('todo');
  });

  it('strips HTML tags from user inputs (XSS prevention)', () => {
    const store = new TodoStore();

    store.add({
      title: '<script>alert(1)</script>Deploy',
      notes: '<b>Ship</b> ASAP',
      category: '<img src=x onerror=alert(1)>Security',
      dueDate: '2024-01-01',
      priority: 'high',
    });

    const [latest] = store.todos();
    expect(latest.title).toBe('alert(1)Deploy');
    expect(latest.notes).toBe('Ship ASAP');
    expect(latest.category).toBe('Security');
  });

  it('marks items as completed with a timestamp', () => {
    const store = new TodoStore();
    const [seed] = store.todos();

    store.setStatus(seed.id, 'done');

    const updated = store.todos().find((todo) => todo.id === seed.id);
    expect(updated?.status).toBe('done');
    expect(updated?.completedAt).toBeTruthy();
  });
});
```

### Тестирование компонентов с TestBed

```typescript
// metric-tile.component.spec.ts
describe('MetricTileComponent', () => {
  let fixture: ComponentFixture<MetricTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricTileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricTileComponent);
  });

  it('renders label, value, and trend', () => {
    fixture.componentRef.setInput('label', 'Velocity');
    fixture.componentRef.setInput('value', '98%');
    fixture.componentRef.setInput('trend', 'up');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.label')?.textContent).toContain('Velocity');
    expect(element.querySelector('h3')?.textContent).toContain('98%');
    expect(element.querySelector('.trend')?.className).toContain('up');
  });
});
```

### Тестирование сервисов

```typescript
// notification.service.spec.ts
describe('NotificationService', () => {
  it('pushes notifications in order', () => {
    const service = new NotificationService();

    service.push({ title: 'A', message: 'One', level: 'info' });
    service.push({ title: 'B', message: 'Two', level: 'warning' });

    const items = service.items();
    expect(items.length).toBe(2);
    expect(items[0].title).toBe('A');
    expect(items[1].level).toBe('warning');
  });

  it('clears notifications', () => {
    const service = new NotificationService();
    service.push({ title: 'A', message: 'One', level: 'info' });

    service.clear();

    expect(service.items().length).toBe(0);
  });
});
```

---

## 2. E2E-тестирование с Playwright

### Конфигурация

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 2,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E тесты

```typescript
// e2e/app.e2e.spec.ts
import { test, expect } from '@playwright/test';

test('landing page shows key navigation and title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Atlas To-Do Studio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
});

test('navigates to academy module (lazy-loaded)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Projects' }).click();

  await expect(page).toHaveURL(/academy/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('creates a new todo item', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Title').fill('Test Todo');
  await page.getByLabel('Notes').fill('Test notes');
  await page.getByRole('button', { name: 'Add Task' }).click();

  await expect(page.getByText('Test Todo')).toBeVisible();
});

test('marks todo as complete', async ({ page }) => {
  await page.goto('/');

  const todoCard = page.locator('.task-card').first();
  await todoCard.getByRole('button', { name: 'Done' }).click();

  await expect(todoCard).toHaveClass(/status-done/);
});
```

---

## 3. Защита от XSS и CSRF

### XSS Prevention

```typescript
// sanitize-html.pipe.ts
@Pipe({ name: 'sanitizeHtml', standalone: true })
export class SanitizeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): string {
    if (!value) return '';
    return this.sanitizer.sanitize(SecurityContext.HTML, value) ?? '';
  }
}

// todo-store.service.ts — санитизация на уровне данных
private sanitizeText(value: string): string {
  return (
    value
      .replace(/<[^>]*>/g, '')           // Удаление HTML тегов
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f]/g, '')   // Удаление control characters
      .trim()
  );
}
```

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data:;"
/>
```

### CSRF Protection

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([errorInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
    ),
  ],
};
```

### Security Checklist

- [x] Все user inputs санитизируются перед сохранением
- [x] `DomSanitizer` используется для dynamic HTML
- [x] HTTP interceptor для централизованной обработки ошибок
- [x] XSRF configuration для защиты от CSRF
- [x] Content Security Policy headers
- [x] Нет `bypassSecurityTrust*` без необходимости

---

## 4. CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: ['**']
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Prettier check
        run: npm run format:check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm test

      - name: Build
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: E2E tests
        run: npm run e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [build, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Deploy to production
        run: |
          echo "Deploy to your hosting provider"
          # netlify deploy --prod --dir=dist/enterprise-angular-architecture/browser
```

### Pipeline Flow

```
Push/PR -> Lint -> Format Check -> Unit Tests -> Build
                                                   |
                                                   v
                                              E2E Tests
                                                   |
                                                   v
                                    Deploy (main branch only)
```

---

## Test Coverage Summary

| Тип теста | Инструмент      | Покрытие                |
| --------- | --------------- | ----------------------- |
| Unit      | Jest            | Services, Stores, Pipes |
| Component | Jest + TestBed  | UI Components           |
| E2E       | Playwright      | User flows, Navigation  |
| Security  | Manual + ESLint | XSS, CSRF               |

### Запуск тестов

```bash
# Unit tests
npm test

# E2E tests
npm run e2e

# Lint
npm run lint

# Full CI locally
npm run format:check && npm run lint && npm test && npm run build
```
