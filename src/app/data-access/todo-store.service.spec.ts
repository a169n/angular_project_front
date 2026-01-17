import { TodoStore } from './todo-store.service';

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
    expect(latest.category).toBe('Delivery');
    expect(latest.priority).toBe('high');
    expect(latest.status).toBe('todo');
  });

  it('strips HTML tags from user inputs', () => {
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
