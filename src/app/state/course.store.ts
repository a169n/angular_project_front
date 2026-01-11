import { Injectable, computed, signal } from '@angular/core';

export interface Course {
  id: string;
  title: string;
  level: 'foundation' | 'advanced';
  durationMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class CourseStore {
  private readonly _courses = signal<Course[]>([
    { id: 'arch', title: 'Enterprise Architecture', level: 'advanced', durationMinutes: 120 },
    { id: 'perf', title: 'Performance Deep Dive', level: 'advanced', durationMinutes: 90 },
    { id: 'rx', title: 'Reactive Data Layer', level: 'advanced', durationMinutes: 110 },
  ]);

  readonly courses = this._courses.asReadonly();
  readonly totalMinutes = computed(() =>
    this._courses().reduce((total, course) => total + course.durationMinutes, 0),
  );

  add(course: Course): void {
    this._courses.update((items) => [...items, course]);
  }
}
