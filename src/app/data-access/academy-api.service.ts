import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, delay, map, of, retry, switchMap, throwError, timeout } from 'rxjs';
import { API_BASE_URL } from '../core/tokens';

export interface AcademyReport {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'completed';
}

@Injectable({ providedIn: 'root' })
export class AcademyApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  loadReports() {
    return of(true).pipe(
      delay(300),
      switchMap(() =>
        this.http.get<AcademyReport[]>(`${this.apiBaseUrl}/reports`).pipe(
          timeout(2000),
          retry({ count: 2, delay: 400 }),
          catchError(() => {
            const fallback: AcademyReport[] = [
              { id: 'arch', title: 'Enterprise Architecture', status: 'completed' },
              { id: 'perf', title: 'Performance Improvement', status: 'in-progress' },
              { id: 'reactive', title: 'Reactive Data Layer', status: 'planned' },
            ];
            return of(fallback);
          }),
        ),
      ),
      map((reports) =>
        reports.map((report) => ({
          ...report,
          title: report.title.toUpperCase(),
        })),
      ),
      catchError((error) => throwError(() => error)),
    );
  }
}
