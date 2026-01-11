import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { CourseStore } from '../../../state/course.store';
import { NotificationService } from '../../../shared/notification.service';

type CourseLevel = 'foundation' | 'advanced';

@Component({
  selector: 'app-course-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="panel planner">
      <h3>Course Builder</h3>
      <p class="muted">Design modular learning tracks with typed inputs and signals.</p>

      <form class="planner-form" [formGroup]="form" (ngSubmit)="addCourse()">
        <label class="planner-field">
          Title
          <input type="text" formControlName="title" placeholder="Course title" />
          @if (form.controls.title.touched && form.controls.title.invalid) {
            <small class="error">Title is required.</small>
          }
        </label>

        <label class="planner-field">
          Level
          <select formControlName="level">
            <option value="foundation">Foundation</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label class="planner-field">
          Duration (minutes)
          <input type="number" min="30" max="240" formControlName="durationMinutes" />
          @if (form.controls.durationMinutes.touched && form.controls.durationMinutes.invalid) {
            <small class="error">Duration must be between 30 and 240 minutes.</small>
          }
        </label>

        <button class="planner-button" type="submit" [disabled]="form.invalid">
          Add course
        </button>
      </form>

      <div class="planner-meta">
        <span>Effort signal: <strong>{{ effortLabel() }}</strong></span>
        <span>Projected total: <strong>{{ projectedTotal() }} min</strong></span>
      </div>

      <ul class="list">
        @for (course of courses(); track course.id) {
          <li>
            <div>
              <strong>{{ course.title }}</strong>
              <span class="pill">{{ course.level }}</span>
            </div>
            <div>
              <span>{{ course.durationMinutes }} min</span>
              <button type="button" class="link" (click)="removeCourse(course.id)">
                Remove
              </button>
            </div>
          </li>
        }
      </ul>
    </article>
  `,
})
export class CoursePlannerComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly courseStore = inject(CourseStore);
  private readonly notifications = inject(NotificationService);

  readonly courses = this.courseStore.courses;

  readonly form = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    level: ['foundation' as CourseLevel, Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(30), Validators.max(240)]],
  });

  private readonly durationSignal = toSignal(
    this.form.controls.durationMinutes.valueChanges.pipe(
      startWith(this.form.controls.durationMinutes.value),
      map((value) => Number(value) || 0),
    ),
    { initialValue: 0 },
  );

  private readonly levelSignal = toSignal(
    this.form.controls.level.valueChanges.pipe(startWith(this.form.controls.level.value)),
    { initialValue: 'foundation' as CourseLevel },
  );

  readonly effortLabel = computed(() => {
    const duration = this.durationSignal();
    const level = this.levelSignal();
    if (duration >= 180 || level === 'advanced') {
      return 'Intensive';
    }
    if (duration >= 120) {
      return 'Deep dive';
    }
    return 'Focused';
  });

  readonly projectedTotal = computed(() => this.courseStore.totalMinutes() + this.durationSignal());

  addCourse(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, level, durationMinutes } = this.form.getRawValue();
    this.courseStore.add({
      id: this.createId(),
      title,
      level,
      durationMinutes,
    });

    this.notifications.push({
      title: 'Course added',
      message: `${title} is now part of the learning path.`,
      level: 'success',
    });

    this.form.reset({
      title: '',
      level: 'foundation',
      durationMinutes: 60,
    });
  }

  removeCourse(id: string): void {
    this.courseStore.remove(id);
    this.notifications.push({
      title: 'Course removed',
      message: 'The course was removed from the plan.',
      level: 'warning',
    });
  }

  private createId(): string {
    return `course-${Math.random().toString(36).slice(2, 8)}`;
  }
}
