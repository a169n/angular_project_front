import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TodoItem } from '../../../data-access/todo-store.service';
import { SanitizeHtmlPipe } from '../../../shared/sanitize-html.pipe';

@Component({
  selector: 'app-initiative-card',
  standalone: true,
  imports: [SanitizeHtmlPipe],
  template: `
    <div class="focus-card">
      <header>
        <h4>{{ todo.title }}</h4>
        <span [class]="'status-pill status-' + todo.status">{{ todo.status }}</span>
      </header>
      <p class="muted" [innerHTML]="todo.notes | sanitizeHtml"></p>
      <div class="focus-meta">
        <span class="chip">{{ todo.category }}</span>
        <span class="chip">{{ todo.priority }} priority</span>
        <span class="chip">Due {{ todo.dueDate || 'TBD' }}</span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitiativeCardComponent {
  @Input({ required: true }) todo!: TodoItem;
}
