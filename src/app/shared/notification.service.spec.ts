import { NotificationService } from './notification.service';

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
