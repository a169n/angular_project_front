import { Injectable, signal } from '@angular/core';

@Injectable()
export class FeatureFlagService {
  private readonly _flags = signal<Record<string, boolean>>({
    performanceInsights: true,
    reactiveDataLayer: true,
  });

  readonly flags = this._flags.asReadonly();

  isEnabled(flag: string): boolean {
    return Boolean(this._flags()[flag]);
  }
}
