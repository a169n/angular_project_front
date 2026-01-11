import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'enterprise-theme';
  private readonly _theme = signal<ThemeMode>('light');

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const initial = this.resolveInitialTheme();
    this.applyTheme(initial);
  }

  readonly theme = this._theme.asReadonly();

  toggle(): void {
    const next = this._theme() === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  private applyTheme(theme: ThemeMode): void {
    this._theme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private resolveInitialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }
}
