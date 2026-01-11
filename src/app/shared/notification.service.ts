import { Injectable, signal } from '@angular/core';

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  title: string;
  message: string;
  level: NotificationLevel;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<NotificationItem[]>([]);
  readonly items = this._items.asReadonly();

  push(item: NotificationItem): void {
    this._items.update((items) => [...items, item]);
  }

  clear(): void {
    this._items.set([]);
  }
}
